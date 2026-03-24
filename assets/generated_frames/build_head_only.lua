-- Rebuild head turnaround only (with corrected head_22deg)
local BASE = "/Users/cristian/Documents/Proyectos/InfovotoProject/infovoto-web/assets/generated_frames/v2_nobg"
local ASEPRITE_OUT = "/Users/cristian/Documents/Proyectos/InfovotoProject/infovoto-web/assets/aseprite"
local SPRITES_OUT = "/Users/cristian/Documents/Proyectos/InfovotoProject/infovoto-web/public/sprites"

local function file_exists(path)
  local f = io.open(path, "r")
  if f then f:close() return true end
  return false
end

local dir = BASE .. "/head"
local files = {
  "head_0deg.png", "head_22deg.png", "head_45deg.png", "head_67deg.png",
  "head_90deg.png", "head_112deg.png", "head_135deg.png", "head_157deg.png",
  "head_180deg.png", "head_202deg.png", "head_225deg.png", "head_247deg.png",
  "head_270deg.png", "head_292deg.png", "head_315deg.png", "head_337deg.png",
}

print("Building head_turnaround with 16 frames")

local spr = app.open(dir .. "/" .. files[1])
spr.frames[1].duration = 0.150

for i = 2, #files do
  local path = dir .. "/" .. files[i]
  if not file_exists(path) then
    print("  WARN: missing " .. path)
    goto continue
  end
  app.command.NewFrame()
  local frame_num = #spr.frames
  local img = Image{ fromFile = path }
  if img then
    local cel = spr.layers[1]:cel(frame_num)
    if cel then cel.image = img
    else spr:newCel(spr.layers[1], frame_num, img, Point(0, 0)) end
    spr.frames[frame_num].duration = 0.150
  end
  ::continue::
end

spr:saveAs(ASEPRITE_OUT .. "/voti_head_turnaround_nobg.aseprite")
print("  Saved (" .. #spr.frames .. " frames)")

app.command.ExportSpriteSheet{
  ui = false,
  type = SpriteSheetType.HORIZONTAL,
  textureFilename = SPRITES_OUT .. "/voti_head_turnaround.png",
  dataFilename = SPRITES_OUT .. "/voti_head_turnaround.json",
  dataFormat = SpriteSheetDataFormat.JSON_ARRAY,
  filenameFormat = "{title} {frame}.aseprite",
  trimSprite = false,
  extrude = false,
}
print("  Exported!")
spr:close()
