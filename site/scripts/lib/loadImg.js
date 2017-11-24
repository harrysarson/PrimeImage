
// todo errors?

export default function loadImg(src) {
  const img = document.createElement('img');

  return new Promise(function executor(resolve) {
    img.onload = function onLoad() {
      resolve(img);
    };

    img.src = src;
  });
}
