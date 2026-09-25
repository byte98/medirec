import { setAssetPath } from "./index.js";
import { defineCustomElement } from "./ion-icon.js";

setAssetPath(new URL("./", import.meta.url).href);

defineCustomElement();
