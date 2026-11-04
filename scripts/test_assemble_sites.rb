require 'minitest/autorun'
require 'tmpdir'
require_relative 'assemble_sites'

class AssemblyTest < Minitest::Test
  def setup
    @temp = Dir.mktmpdir
    @current = "#{@temp}/current"
    @legacy = "#{@temp}/legacy"
    [@current, @legacy].each { |p| FileUtils.mkdir_p(p); File.write("#{p}/index.html", 'Home') }
    FileUtils.mkdir_p("#{@legacy}/_nuxt")
    File.write("#{@legacy}/_nuxt/app.js", 'const base="/chart-data/"; const separator="/";')
    File.write("#{@legacy}/pref.html", 'Chapter')
  end

  def teardown
    FileUtils.remove_entry(@temp)
  end

  def test_legacy_nuxt_alias_and_query_strings
    assert_equal '/chart/old/_nuxt/app.js?v=1#x', SiteAssembly.archive_url('/chart-data/_nuxt/app.js?v=1#x', @legacy, '/chart')
    assert_equal '/chart/old/', SiteAssembly.archive_url('/chart-data/', @legacy, '/chart')
    assert_equal '/chart/old/pref?cache=${Math.random()}', SiteAssembly.archive_url('https://stratigraphy.org/chart-data/pref?cache=${Math.random()}', @legacy, '/chart')
  end

  def test_external_applications_and_relative_links_are_preserved
    %w[/gssps/ https://example.com/pref pref#x].each do |url|
      assert_equal url, SiteAssembly.archive_url(url, @legacy, '/guide')
    end
    assert_equal '/guide/old/pref', SiteAssembly.archive_url('/guide/pref', @legacy, '/guide')
  end

  def test_current_files_and_archive_assets_are_preserved
    SiteAssembly.assemble(@current, @legacy, "#{@temp}/output", '/chart')
    assert_equal 'Home', File.read("#{@temp}/output/index.html")
    assert_equal 'const base="/chart/old/"; const separator="/";', File.read("#{@temp}/output/old/_nuxt/app.js")
  end

  def test_existing_destination_is_rejected
    assert_raises(RuntimeError) { SiteAssembly.assemble(@current, @legacy, @current, '/guide') }
  end
end
