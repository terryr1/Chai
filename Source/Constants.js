const { Dimensions } = require("react-native");

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;
const backgroundColor = "black";
const accentColorOne = "#4285F4";
const accentColorTwo = "#E65858";
const mainTextColor = "white";

export default {
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  backgroundColor,
  accentColorOne,
  accentColorTwo,
  mainTextColor,
};
