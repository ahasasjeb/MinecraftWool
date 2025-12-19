import { WoolColor } from './types';

// Minecraft Wool Hex Colors
export const WOOL_COLORS: Record<WoolColor, string> = {
  [WoolColor.White]: '#FFFFFF',
  [WoolColor.Orange]: '#D87F33',
  [WoolColor.Magenta]: '#B24CD8',
  [WoolColor.LightBlue]: '#6699D8',
  [WoolColor.Yellow]: '#E5E533',
  [WoolColor.Lime]: '#7FCC19',
  [WoolColor.Pink]: '#F27FA5',
  [WoolColor.Gray]: '#4C4C4C',
  [WoolColor.LightGray]: '#999999',
  [WoolColor.Cyan]: '#4C7F99',
  [WoolColor.Purple]: '#7F3FB2',
  [WoolColor.Blue]: '#334CB2',
  [WoolColor.Brown]: '#664C33',
  [WoolColor.Green]: '#667F33',
  [WoolColor.Red]: '#993333',
  [WoolColor.Black]: '#191919',
};

// Chinese Names for UI
export const WOOL_NAMES: Record<WoolColor, string> = {
  [WoolColor.White]: '白色羊毛',
  [WoolColor.Orange]: '橙色羊毛',
  [WoolColor.Magenta]: '品红色羊毛',
  [WoolColor.LightBlue]: '淡蓝色羊毛',
  [WoolColor.Yellow]: '黄色羊毛',
  [WoolColor.Lime]: '黄绿色羊毛',
  [WoolColor.Pink]: '粉红色羊毛',
  [WoolColor.Gray]: '灰色羊毛',
  [WoolColor.LightGray]: '淡灰色羊毛',
  [WoolColor.Cyan]: '青色羊毛',
  [WoolColor.Purple]: '紫色羊毛',
  [WoolColor.Blue]: '蓝色羊毛',
  [WoolColor.Brown]: '棕色羊毛',
  [WoolColor.Green]: '绿色羊毛',
  [WoolColor.Red]: '红色羊毛',
  [WoolColor.Black]: '黑色羊毛',
};

// Minecraft English IDs for Export/Import
export const WOOL_IDS: Record<WoolColor, string> = {
  [WoolColor.White]: 'white_wool',
  [WoolColor.Orange]: 'orange_wool',
  [WoolColor.Magenta]: 'magenta_wool',
  [WoolColor.LightBlue]: 'light_blue_wool',
  [WoolColor.Yellow]: 'yellow_wool',
  [WoolColor.Lime]: 'lime_wool',
  [WoolColor.Pink]: 'pink_wool',
  [WoolColor.Gray]: 'gray_wool',
  [WoolColor.LightGray]: 'light_gray_wool',
  [WoolColor.Cyan]: 'cyan_wool',
  [WoolColor.Purple]: 'purple_wool',
  [WoolColor.Blue]: 'blue_wool',
  [WoolColor.Brown]: 'brown_wool',
  [WoolColor.Green]: 'green_wool',
  [WoolColor.Red]: 'red_wool',
  [WoolColor.Black]: 'black_wool',
};

// Chunk size for 3D visualization (Minecraft style 16x16)
export const CHUNK_SIZE = 16;
