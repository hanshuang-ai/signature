function setRem(){
  let screenWidth = window.innerWidth;
  let remValue = screenWidth / 750;
  console.log(remValue, 'remValue');
  document.documentElement.style.fontSize = remValue + 'px';
}
setRem()
window.addEventListener('resize', setRem);
