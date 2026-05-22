// iROUP Auto Image URL Helper
function iroupImageUrl(url){
  url = String(url || '').trim();
  if(!url) return '';
  let m = url.match(/\/file\/d\/([^/]+)/);
  if(m) return `https://drive.google.com/uc?export=view&id=${m[1]}`;
  m = url.match(/[?&]id=([^&]+)/);
  if(url.includes('drive.google.com') && m) return `https://drive.google.com/uc?export=view&id=${m[1]}`;
  return url;
}
function iroupPickImage(row){
  if(!row) return '';
  const keys = [
    'Poster_URL','Poster URL','poster_url','poster','Poster',
    'Poster_Clean','Poster Clean',
    'Banner_URL','Banner URL','banner_url','banner','Banner',
    'รูปปก_URL','รูปปก URL','รูปปก',
    'รูปภาพ_URL','รูปภาพ','ไฟล์รูป','ไฟล์รูป_URL',
    'Image_URL','Image URL','image_url','image','Image',
    'แบนเนอร์','แบนเนอร์_URL'
  ];
  for(const k of keys){
    const v = row[k];
    if(v !== undefined && v !== null && String(v).trim() !== ''){
      return iroupImageUrl(v);
    }
  }
  return '';
}

const IROUP_IMAGE_UPLOAD_DEFAULTS = {
  maxWidth: 2000,
  maxHeight: 2000,
  quality: 0.9,
  minBytes: 700 * 1024,
  minSavingsRatio: 0.08,
  outputType: 'image/jpeg'
};

function iroupIsOptimizableImage(file){
  if(!file || !file.type) return false;
  const type = String(file.type || '').toLowerCase();
  return type.indexOf('image/') === 0 && type !== 'image/gif' && type !== 'image/svg+xml';
}

async function iroupOptimizeImageForUpload(file, options){
  const opts = Object.assign({}, IROUP_IMAGE_UPLOAD_DEFAULTS, options || {});
  if(!iroupIsOptimizableImage(file) || Number(file.size || 0) < opts.minBytes){
    return { file, originalFile: file, optimized: false, reason: 'skipped' };
  }

  try{
    const bitmap = await iroupLoadImageBitmap_(file);
    const width = bitmap.width || 0;
    const height = bitmap.height || 0;
    const scale = Math.min(1, opts.maxWidth / width, opts.maxHeight / height);
    if(!width || !height || scale >= 1){
      iroupCloseBitmap_(bitmap);
      return { file, originalFile: file, optimized: false, reason: 'already-small' };
    }

    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    iroupCloseBitmap_(bitmap);

    const blob = await iroupCanvasToBlob_(canvas, opts.outputType, opts.quality);
    if(!blob || blob.size >= file.size * (1 - opts.minSavingsRatio)){
      return { file, originalFile: file, optimized: false, reason: 'not-smaller' };
    }

    const optimizedFile = iroupCreateOptimizedFile_(blob, file.name, opts.outputType);
    return {
      file: optimizedFile,
      originalFile: file,
      optimized: true,
      originalSize: file.size,
      optimizedSize: optimizedFile.size,
      originalWidth: width,
      originalHeight: height,
      width: targetWidth,
      height: targetHeight
    };
  }catch(error){
    console.warn('[iroup-image-upload] image optimization skipped', error);
    return { file, originalFile: file, optimized: false, reason: 'error', error };
  }
}

function iroupLoadImageBitmap_(file){
  if(window.createImageBitmap){
    return window.createImageBitmap(file);
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image preview decode failed.'));
    };
    img.src = url;
  });
}

function iroupCloseBitmap_(bitmap){
  if(bitmap && typeof bitmap.close === 'function'){
    bitmap.close();
  }
}

function iroupCanvasToBlob_(canvas, type, quality){
  return new Promise(resolve => {
    canvas.toBlob(resolve, type, quality);
  });
}

function iroupCreateOptimizedFile_(blob, fileName, type){
  const baseName = String(fileName || 'image').replace(/\.[^.]+$/, '');
  const nextName = baseName + '-optimized.jpg';
  return new File([blob], nextName, {
    type: type || blob.type || 'image/jpeg',
    lastModified: Date.now()
  });
}
