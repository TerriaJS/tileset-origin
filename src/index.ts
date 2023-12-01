#!/usr/bin/env node

import * as Cesium from "cesium";
import fs from "fs";

function main(): void {
  if (process.argv.length !== 3) {
    console.error("Usage: node index.js <path to tileset.json>");
    process.exit(1);
  }

  const tilesetPath = process.argv[2];

  // Read the tileset.json file
  fs.readFile(
    tilesetPath,
    "utf8",
    (err: NodeJS.ErrnoException | null, data: string) => {
      if (err) {
        console.error(`Error reading file: ${err}`);
        return;
      }

      try {
        const tileset = JSON.parse(data);

        // Extract the root transform matrix
        const matrixValues = tileset.root.transform;

        if (!matrixValues || matrixValues.length !== 16) {
          console.error("Invalid or missing transform matrix in tileset.json");
          return;
        }

        // Unpack the matrix
        const mat = Cesium.Matrix4.unpack(matrixValues);

        // Get the translation from the matrix
        const pos = Cesium.Matrix4.getTranslation(mat, new Cesium.Cartesian3());
        const carto = new Cesium.Cartographic();
        Cesium.Cartographic.fromCartesian(pos, Cesium.Ellipsoid.WGS84, carto);

        // Log the geographic coordinates
        console.log(
          `Longitude: ${Cesium.Math.toDegrees(carto.longitude).toFixed(6)}`,
          `Latitude: ${Cesium.Math.toDegrees(carto.latitude).toFixed(6)}`,
          `Height: ${carto.height.toFixed(2)}`
        );
      } catch (jsonErr) {
        console.error(`Error parsing JSON: ${jsonErr}`);
      }
    }
  );
}

main();
