exports.getRandomNumbers = (num) => {
  const str = num.toString();
  return "0".repeat(5 - str.length) + str;
};
