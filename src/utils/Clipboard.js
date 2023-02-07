
export const CopyText = (text) => {
  const element = document.createElement("textarea");
  element.style.position = "absolute";
  element.style.right = "-9999px";
  const yPosition = window.pageYOffset || document.documentElement.scrollTop;
  element.style.top = `${yPosition}px`;

  element.value = text;

  setTimeout(() => {
    document.body.appendChild(element);

    element.select();
    document.execCommand("copy");

    document.body.removeChild(element);
  }, 100);
};
