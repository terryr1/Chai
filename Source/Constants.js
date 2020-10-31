const { Dimensions } = require("react-native");

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;
const agent = `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24" fill="black" width="18px" height="18px"><g><rect fill="none" height="24" width="24"/></g><g><g><path d="M21,12.22C21,6.73,16.74,3,12,3c-4.69,0-9,3.65-9,9.28C2.4,12.62,2,13.26,2,14v2c0,1.1,0.9,2,2,2h1v-6.1 c0-3.87,3.13-7,7-7s7,3.13,7,7V19h-8v2h8c1.1,0,2-0.9,2-2v-1.22c0.59-0.31,1-0.92,1-1.64v-2.3C22,13.14,21.59,12.53,21,12.22z"/><circle cx="9" cy="13" r="1"/><circle cx="15" cy="13" r="1"/><path d="M18,11.03C17.52,8.18,15.04,6,12.05,6c-3.03,0-6.29,2.51-6.03,6.45c2.47-1.01,4.33-3.21,4.86-5.89 C12.19,9.19,14.88,11,18,11.03z"/></g></g></svg>`;
const messageListBg = `<svg
xmlns:dc="http://purl.org/dc/elements/1.1/"
xmlns:cc="http://creativecommons.org/ns#"
xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
xmlns:svg="http://www.w3.org/2000/svg"
xmlns="http://www.w3.org/2000/svg"
xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
width="480mm"
height="598.14447mm"
viewBox="0 0 479.99999 598.14446"
version="1.1"
id="svg8"
inkscape:version="0.92.4 (5da689c313, 2019-01-14)"
sodipodi:docname="chaibg2.svg">
<defs
  id="defs2" />
<sodipodi:namedview
  id="base"
  pagecolor="#ffffff"
  bordercolor="#666666"
  borderopacity="1.0"
  inkscape:pageopacity="0.0"
  inkscape:pageshadow="2"
  inkscape:zoom="0.24748737"
  inkscape:cx="1271.3964"
  inkscape:cy="1282.0546"
  inkscape:document-units="mm"
  inkscape:current-layer="layer1"
  showgrid="false"
  inkscape:lockguides="false"
  inkscape:window-width="1920"
  inkscape:window-height="1001"
  inkscape:window-x="-9"
  inkscape:window-y="-9"
  inkscape:window-maximized="1" />
<metadata
  id="metadata5">
 <rdf:RDF>
   <cc:Work
      rdf:about="">
     <dc:format>image/svg+xml</dc:format>
     <dc:type
        rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
     <dc:title />
   </cc:Work>
 </rdf:RDF>
</metadata>
<g
  inkscape:label="Layer 1"
  inkscape:groupmode="layer"
  id="layer1"
  transform="translate(24.393099,35.469811)">
 <path
    style="fill:#4285f4;fill-opacity:0.67635899;stroke:none;stroke-width:0.26458335px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
    d="m -22.18141,-35.469811 -2.164504,387.061381 c 0,0 287.192964,-80.85234 294.751264,68.81858 6.23125,123.39244 185.20155,142.2645 185.20155,142.2645 l -0.0517,-598.14446 z"
    id="path1396"
    inkscape:connector-curvature="0"
    sodipodi:nodetypes="ccsccc" />
 <path
    style="fill:#4285f4;fill-opacity:0.67635899;stroke:none;stroke-width:0.26458335px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
    d="m -24.393099,-35.46981 0.04718,388.13046 c 0,0 109.408452,80.86016 248.432079,143.60418 121.82248,54.98081 187.8165,60.13096 223.71083,65.32563 5.06823,0.73348 7.8099,1.08419 7.8099,1.08419 l -2.26357,-598.14446 z"
    id="path1394"
    inkscape:connector-curvature="0"
    sodipodi:nodetypes="ccssccc" />
 <path
    style="fill:#4285f4;fill-opacity:0.67635899;stroke:none;stroke-width:0.26458335px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
    d="m -24.345914,351.59157 c 27.7938643,20.07995 186.190784,2.60711 195.092434,118.03388 13.8044,179.00025 156.26927,4.79931 284.86038,93.0492 l -0.0517,-598.14446 -477.736502,-10e-7 z"
    id="path1398"
    inkscape:connector-curvature="0"
    sodipodi:nodetypes="cscccc" />
</g>
</svg>`;
const backgroundColor = "black";
const accentColorOne = "#4285F4";
const accentColorTwo = "#E65858";
const mainTextColor = "white";

export default {
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  agent,
  backgroundColor,
  accentColorOne,
  accentColorTwo,
  mainTextColor,
  messageListBg
};
