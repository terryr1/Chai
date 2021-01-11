const { Dimensions } = require("react-native");

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;
const backgroundColor = "black";
const accentColorOne = "#4285F4";
const accentColorTwo = "#E65858";
const mainTextColor = "white";
const categories = [
  "Celebration",
  "Relationships",
  "Motivation",
  "Philosophy",
  "Self Improvement",
  "Venting",
  "Humor",
  "Career Advice",
  "Life Advice",
  "Anything",
];
const languages = ["English", "Other"];

export default {
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  backgroundColor,
  accentColorOne,
  accentColorTwo,
  mainTextColor,
  categories,
  languages
};
