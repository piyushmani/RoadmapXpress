import * as React from "react";
import { ThemeIcon } from "@/components/icons";

const themeOptions = [
    {
      "name": "default",
      "vertex": {
        "fillColor": "#ffe6cc",
        "strokeColor": "#d79b00",
        "fontColor": "#3C3D3B"
      },
      "edge": {
        "strokeColor": "#696969"
      }
    },
    {
      "name": "black_white",
      "vertex": {
        "fillColor": "rgb(255, 255, 255)",
        "strokeColor": "rgb(0, 0, 0)",
        "fontColor": "rgb(0, 0, 0)"
      },
      "edge": {
        "strokeColor": "rgb(0, 0, 0)"
      }
    },
    {
      "name": "red_orange",
      "vertex": {
        "fillColor": "rgb(242, 204, 143)",
        "strokeColor": "rgb(224, 122, 95)",
        "fontColor": "rgb(57, 60, 86)"
      },
      "edge": {
        "strokeColor": "rgb(224, 122, 95)"
      }
    },
    {
      "name": "baigan",
      "vertex": {
        "fillColor": "rgb(24, 46, 62)",
        "strokeColor": "rgb(255, 255, 255)",
        "fontColor": "rgb(255, 255, 255)"
      },
      "edge": {
        "strokeColor": "rgb(35, 68, 93)"
      }
    },
    {
      "name": "light_green",
      "vertex": {
        "fillColor": "rgb(9, 85, 91)",
        "strokeColor": "rgb(186, 200, 211)",
        "fontColor": "rgb(238, 238, 238)"
      },
      "edge": {
        "strokeColor": "rgb(11, 77, 106)"
      }
    },
    {
      "name": "yellow_green",
      "vertex": {
        "fillColor": "rgb(250, 229, 199)",
        "strokeColor": "rgb(15, 139, 141)",
        "fontColor": "rgb(20, 54, 66)"
      },
      "edge": {
        "strokeColor": "rgb(168, 32, 26)"
      }
    },
    {
      "name": "too_light_green",
      "vertex": {
        "fillColor": "rgb(168, 218, 220)",
        "strokeColor": "rgb(69, 123, 157)",
        "fontColor": "rgb(29, 53, 87)"
      },
      "edge": {
        "strokeColor": "rgb(69, 123, 157)"
      }
    },
    {
      "name": "purple",
      "vertex": {
        "fillColor": "rgb(86, 81, 126)",
        "strokeColor": "rgb(238, 238, 238)",
        "fontColor": "rgb(255, 255, 255)"
      },
      "edge": {
        "strokeColor": "rgb(24, 46, 62)"
      }
    },
    {
      "name": "too_light_green2",
      "vertex": {
        "fillColor": "rgb(178, 201, 171)",
        "strokeColor": "rgb(120, 138, 163)",
        "fontColor": "rgb(70, 73, 93)"
      },
      "edge": {
        "strokeColor": "rgb(120, 138, 163)"
      }
    },
    
  ];

export default function ThemeSelector({ onSelectTheme }) {

    const handleThemeSelect = (selectedTheme) => {
        onSelectTheme(selectedTheme);
    };

  return (
    <div className="flex flex-wrap gap-x-0.5">
      {themeOptions?.map(
            (item, index) => (
                <div style={{maxWidth:'45px', maxHeight:'60px', filter: 'blur(0.6px)',cursor:'pointer' }} key={index} onClick={() => handleThemeSelect(item)}>
                <ThemeIcon shapeFill={item.vertex.fillColor} 
                   shapStroke={item.vertex.strokeColor} textFill={item.vertex.fontColor} linkStroke={item.edge.strokeColor}>
                </ThemeIcon>
                </div>
            )    
          )}
    </div>
  )
}

