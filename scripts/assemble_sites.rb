# Build one Pages artifact with the current site and a frozen, rebased /old archive.
require 'cgi'
require 'digest'
require 'fileutils'
require 'uri'

module SiteAssembly
  def self.manifest(root)
    Dir.glob("#{root}/**/*", File::FNM_DOTMATCH).select { |p| File.file?(p) }.to_h do |path|
      [path.delete_prefix("#{root}/"), Digest::SHA256.file(path).hexdigest]
    end
  end

  def self.archive_url(url, root, base)
    raw_path, suffix = url.split(/(?=[?#])/, 2)
    suffix ||= ''
    uri = URI.parse(CGI.unescapeHTML(raw_path))
    return url if uri.host && !%w[stratigraphy.org www.stratigraphy.org].include?(uri.host)
    return url if uri.scheme && !%w[http https].include?(uri.scheme)
    path = uri.path.to_s
    path = '/' if path.empty? && uri.host
    return url unless path.start_with?('/')
    return url if path == '/' && !uri.host
    aliases = [base]
    aliases << '/chart-data' if base == '/chart'
    prefix = aliases.find { |value| path == value || path.start_with?("#{value}/") }
    relative = prefix ? path.delete_prefix(prefix).delete_prefix('/') : path.delete_prefix('/')
    return url if relative.split('/').include?('..')
    local = File.join(root, URI::DEFAULT_PARSER.unescape(relative))
    return url unless [local, "#{local}/index.html", "#{local}.html"].any? { |candidate| File.file?(candidate) }
    "#{base}/old/#{relative}#{suffix}"
  rescue URI::InvalidURIError
    url
  end

  def self.assemble(current, legacy, output, base)
    raise 'Current home page missing' unless File.file?("#{current}/index.html")
    raise 'Legacy home page missing' unless File.file?("#{legacy}/index.html")
    raise 'Use a fresh destination' if File.exist?(output)
    raise 'Current source already owns /old' if File.exist?("#{current}/old")
    before = manifest(current)
    FileUtils.cp_r(current, output)
    archive = "#{output}/old"
    FileUtils.cp_r(legacy, archive)
    Dir.glob("#{archive}/**/*").each do |path|
      next unless File.file?(path) && %w[.html .css .js .json].include?(File.extname(path))
      text = File.read(path)
      # Rebase literal asset/page URLs, including legacy Nuxt's /chart-data base.
      text = text.gsub(/(["'\x60])((?:https?:\/\/stratigraphy\.org)?\/[^"'\x60\s<>]*)\1/) do
        quote, url = Regexp.last_match.captures
        if %w[.js .json].include?(File.extname(path))
          local_url = url.sub(%r{\Ahttps?://stratigraphy\.org}, '')
          prefixes = [base, ('/chart-data' if base == '/chart')].compact
          next quote + url + quote unless prefixes.any? { |p| local_url == p || local_url.start_with?("#{p}/") }
        end
        quote + archive_url(url, legacy, base) + quote
      end
      text = text.gsub(/url\((\/[^)'"]+)\)/) { 'url(' + archive_url(Regexp.last_match(1), legacy, base) + ')' }
      # The archived chart used two relative links for separately hosted apps.
      if base == '/chart'
        text = text.gsub(/href:(["'])(guide|gssps)\1/) { 'href:' + Regexp.last_match(1) + '/' + Regexp.last_match(2) + '/' + Regexp.last_match(1) }
      end
      File.write(path, text)
    end
    after = manifest(output)
    raise 'Current files changed during assembly' unless before.all? { |path, digest| after[path] == digest }
    raise 'Archive files missing' unless manifest(legacy).keys.all? { |path| File.file?("#{archive}/#{path}") }
    size = Dir.glob("#{output}/**/*").select { |p| File.file?(p) }.sum { |p| File.size(p) }
    raise 'Combined site exceeds Pages 1 GB limit' unless size < 1_000_000_000
    puts "Preserved #{before.length} current files; archived #{manifest(legacy).length} files at #{base}/old/; #{(size / 1_000_000.0).round(1)} MB."
  end
end

if $PROGRAM_NAME == __FILE__
  abort 'Usage: assemble_sites.rb CURRENT LEGACY OUTPUT BASEURL' unless ARGV.length == 4
  SiteAssembly.assemble(*ARGV)
end
