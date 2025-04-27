export const getColorName = (hex: string) => {
    switch (hex.toLowerCase()) {
      case "#ff0000":
        return "Red";
      case "#00ff00":
        return "Green";
      case "#0000ff":
        return "Blue";
      case "#000000":
        return "Black";
      case "#ffffff":
        return "White";
      case "#ffff00":
        return "Yellow";
      case "#ffa500":
        return "Orange";
      case "#800080":
        return "Purple";
      case "#00ffff":
        return "Cyan";
      case "#ffc0cb":
        return "Pink";
      // Add more if you want!
      default:
        return hex; // fallback: just show the hex if unknown
    }
  };  