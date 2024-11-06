function stringToColor(
  inputString: string,
  saturationMin: number = 80,
  saturationMax: number = 100,
  lightnessMin: number = 40,
  lightnessMax: number = 70,
) {
  // Calculate a hash code for the input string
  let hashCode = 0;
  for (let i = 0; i < inputString.length; i++) {
    hashCode = (hashCode << 5) - hashCode + inputString.charCodeAt(i);
  }

  // Map the hash code to a value within the specified saturation range
  const saturationRange = saturationMax - saturationMin + 1;
  const adjustedSaturation =
    (Math.abs(hashCode) % saturationRange) + saturationMin;

  // Map the hash code to a value within the specified lightness range
  const lightnessRange = lightnessMax - lightnessMin + 1;
  const adjustedLightness =
    (Math.abs(hashCode) % lightnessRange) + lightnessMin;

  // Generate a color using the adjusted saturation and lightness
  const generatedColor = `hsl(${
    Math.abs(hashCode) % 360
  }, ${adjustedSaturation}%, ${adjustedLightness}%)`;

  return generatedColor;
}

export default stringToColor;
