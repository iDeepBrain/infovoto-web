-- build_spritesheets.lua
-- Batch import no-bg frames into Aseprite and export spritesheets + JSON
-- Run: /Applications/Aseprite.app/Contents/MacOS/aseprite -b --script build_spritesheets.lua

local BASE = "/Users/cristian/Documents/Proyectos/InfovotoProject/infovoto-web/assets/generated_frames/v2_nobg"
local ASEPRITE_OUT = "/Users/cristian/Documents/Proyectos/InfovotoProject/infovoto-web/assets/aseprite"
local SPRITES_OUT = "/Users/cristian/Documents/Proyectos/InfovotoProject/infovoto-web/public/sprites"

-- Animation expressions (6 frames each, named frame1.png..frame6.png)
local animations = {
  "open_eyes_neutral",
  "happy_talking",
  "thinking_squint",
  "explaining_talking",
  "loading_patient",
  "loading_worried",
  "thinking_worried",
  "happy_celebrating",
  "explaining_side",
  "idle_half_blink",
}

local function file_exists(path)
  local f = io.open(path, "r")
  if f then f:close() return true end
  return false
end

local function build_animation(name, frame_dir, frame_pattern, frame_count, duration_ms)
  print("Building: " .. name)

  -- Check first frame exists
  local first = string.format(frame_pattern, 1)
  if not file_exists(first) then
    print("  SKIP - frames not found: " .. first)
    return
  end

  -- Open first frame as new sprite
  local spr = app.open(first)
  if not spr then
    print("  ERROR opening " .. first)
    return
  end

  -- Set first frame duration
  spr.frames[1].duration = duration_ms / 1000.0

  -- Import remaining frames
  for i = 2, frame_count do
    local path = string.format(frame_pattern, i)
    if not file_exists(path) then
      print("  WARN: missing " .. path)
      break
    end

    -- Add new frame
    app.command.NewFrame()
    local frame_num = #spr.frames

    -- Import image into current frame
    local img = Image{ fromFile = path }
    if img then
      local cel = spr.layers[1]:cel(frame_num)
      if cel then
        cel.image = img
      else
        spr:newCel(spr.layers[1], frame_num, img, Point(0, 0))
      end
      spr.frames[frame_num].duration = duration_ms / 1000.0
    end
  end

  -- Save .aseprite
  local ase_path = ASEPRITE_OUT .. "/voti_" .. name .. "_nobg.aseprite"
  spr:saveAs(ase_path)
  print("  Saved: " .. ase_path)

  -- Export spritesheet
  local png_path = SPRITES_OUT .. "/voti_" .. name .. ".png"
  local json_path = SPRITES_OUT .. "/voti_" .. name .. ".json"

  app.command.ExportSpriteSheet{
    ui = false,
    type = SpriteSheetType.HORIZONTAL,
    textureFilename = png_path,
    dataFilename = json_path,
    dataFormat = SpriteSheetDataFormat.JSON_ARRAY,
    filenameFormat = "{title} {frame}.aseprite",
    trimSprite = false,
    extrude = false,
    listLayers = false,
    listTags = false,
    listSlices = false,
  }
  print("  Exported: " .. png_path)

  -- Close sprite
  spr:close()
end

local function build_turnaround(name, dir, file_list, duration_ms)
  print("Building turnaround: " .. name)

  -- Check first file
  if not file_exists(dir .. "/" .. file_list[1]) then
    print("  SKIP - files not found in: " .. dir)
    return
  end

  -- Open first frame
  local spr = app.open(dir .. "/" .. file_list[1])
  if not spr then
    print("  ERROR opening first file")
    return
  end
  spr.frames[1].duration = duration_ms / 1000.0

  -- Import remaining frames
  for i = 2, #file_list do
    local path = dir .. "/" .. file_list[i]
    if not file_exists(path) then
      print("  WARN: missing " .. path)
      goto continue
    end

    app.command.NewFrame()
    local frame_num = #spr.frames

    local img = Image{ fromFile = path }
    if img then
      local cel = spr.layers[1]:cel(frame_num)
      if cel then
        cel.image = img
      else
        spr:newCel(spr.layers[1], frame_num, img, Point(0, 0))
      end
      spr.frames[frame_num].duration = duration_ms / 1000.0
    end

    ::continue::
  end

  -- Save .aseprite
  local ase_path = ASEPRITE_OUT .. "/voti_" .. name .. "_nobg.aseprite"
  spr:saveAs(ase_path)
  print("  Saved: " .. ase_path .. " (" .. #spr.frames .. " frames)")

  -- Export spritesheet
  local png_path = SPRITES_OUT .. "/voti_" .. name .. ".png"
  local json_path = SPRITES_OUT .. "/voti_" .. name .. ".json"

  app.command.ExportSpriteSheet{
    ui = false,
    type = SpriteSheetType.HORIZONTAL,
    textureFilename = png_path,
    dataFilename = json_path,
    dataFormat = SpriteSheetDataFormat.JSON_ARRAY,
    filenameFormat = "{title} {frame}.aseprite",
    trimSprite = false,
    extrude = false,
  }
  print("  Exported: " .. png_path)

  spr:close()
end

-- ===== BUILD ANIMATIONS =====
print("=== Building 10 animation spritesheets ===")
for _, name in ipairs(animations) do
  local frame_dir = BASE .. "/animations/" .. name
  local pattern = frame_dir .. "/frame%d.png"
  build_animation(name, frame_dir, pattern, 6, 150)
end

-- ===== BUILD TURNAROUNDS =====
-- Body turnaround: 16 angles (need to identify the selected files)
-- These are the angles used in the original Aseprite file
local body_angles = {
  "body_0deg.png", "body_22deg.png", "body_45deg.png", "body_67deg.png",
  "body_90deg.png", "body_112deg.png", "body_135deg.png", "body_157deg.png",
  "body_180deg.png", "body_202deg.png", "body_225deg.png", "body_247deg.png",
  "body_270deg.png", "body_292deg.png", "body_315deg.png", "body_337deg.png",
}

local head_angles = {
  "head_0deg.png", "head_22deg.png", "head_45deg.png", "head_67deg.png",
  "head_90deg.png", "head_112deg.png", "head_135deg.png", "head_157deg.png",
  "head_180deg.png", "head_202deg.png", "head_225deg.png", "head_247deg.png",
  "head_270deg.png", "head_292deg.png", "head_315deg.png", "head_337deg.png",
}

print("\n=== Building turnaround spritesheets ===")
build_turnaround("body_turnaround", BASE .. "/fullbody", body_angles, 150)
build_turnaround("head_turnaround", BASE .. "/head", head_angles, 150)

print("\n=== ALL DONE ===")
