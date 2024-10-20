

export type RGBColor = {
    r:number 
    g:number 
    b:number
}

export function hexToRgb(hex:string): RGBColor{
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
  
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : {
      r:255,
      g:255,
      b:255
    };
  }

export function contrastColor(color:RGBColor): "white"|"black"{
    const luma = ((0.299 * color.r) + (0.587 * color.g) + (0.114 * color.b)) / 255;
    return luma>0.5? 'black':'white'
}

