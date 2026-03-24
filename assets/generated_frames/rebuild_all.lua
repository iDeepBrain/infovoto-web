-- rebuild_all.lua
-- Full pipeline: import nobg frames → set palette → set tags → export spritesheets
-- Run: /Applications/Aseprite.app/Contents/MacOS/aseprite -b --script rebuild_all.lua

local BASE = "/Users/cristian/Documents/Proyectos/InfovotoProject/infovoto-web/assets/generated_frames/v2_nobg_cut"
local ASE_DIR = "/Users/cristian/Documents/Proyectos/InfovotoProject/infovoto-web/assets/aseprite"
local SPRITES_OUT = "/Users/cristian/Documents/Proyectos/InfovotoProject/infovoto-web/public/sprites"

-- Unified Voti palette (22 colors)
local VOTI_PALETTE = {
  0x070B17, 0x101727, 0x2A303E, 0x3D3D4D, 0x5A2526, 0x632B31,
  0xA43F3A, 0x69B1A4, 0x5C5E63, 0x5D656A, 0x7F8588, 0x8C8F91,
  0x979A9C, 0xB6B4B0, 0xC4BDAE, 0xC5C6C7, 0xCDCDCE, 0xE7E1D2,
  0xEBE6D4, 0xF1F1EC, 0xF4F3EC, 0xFFFFFF,
}

local function hex_to_color(hex)
  local r = (hex >> 16) & 0xFF
  local g = (hex >> 8) & 0xFF
  local b = hex & 0xFF
  return Color{ r = r, g = g, b = b, a = 255 }
end

local function file_exists(path)
  local f = io.open(path, "r")
  if f then f:close() return true end
  return false
end

local function build_and_polish(name, frame_paths, tag_name, tag_dir, dur_ms)
  print("Building: " .. name)

  -- Verify first frame to get dimensions
  if not file_exists(frame_paths[1]) then
    print("  SKIP - first frame not found: " .. frame_paths[1])
    return
  end

  -- Get dimensions from first image
  local ref = Image{ fromFile = frame_paths[1] }
  if not ref then
    print("  ERROR loading " .. frame_paths[1])
    return
  end
  local w, h = ref.width, ref.height

  -- Create blank canvas (avoids app.open frame duplication bug)
  local spr = Sprite(w, h, ColorMode.RGB)
  spr.frames[1].duration = dur_ms / 1000.0

  -- Place first frame
  spr:newCel(spr.layers[1], 1, ref, Point(0, 0))

  -- Import remaining frames
  for i = 2, #frame_paths do
    if not file_exists(frame_paths[i]) then
      print("  WARN: missing " .. frame_paths[i])
      goto skip
    end
    spr:newEmptyFrame()
    local fn = #spr.frames
    local img = Image{ fromFile = frame_paths[i] }
    if img then
      spr:newCel(spr.layers[1], fn, img, Point(0, 0))
      spr.frames[fn].duration = dur_ms / 1000.0
    end
    ::skip::
  end

  -- Set unified palette
  local pal = Palette(#VOTI_PALETTE)
  for i, hex in ipairs(VOTI_PALETTE) do
    pal:setColor(i - 1, hex_to_color(hex))
  end
  spr:setPalette(pal)

  -- Create animation tag
  while #spr.tags > 0 do spr:deleteTag(spr.tags[1]) end

  local direction
  if tag_dir == "pingpong" then direction = AniDir.PING_PONG
  elseif tag_dir == "reverse" then direction = AniDir.REVERSE
  else direction = AniDir.FORWARD end

  spr:newTag(1, #spr.frames)
  spr.tags[1].name = tag_name
  spr.tags[1].aniDir = direction

  -- Save .aseprite
  local ase_path = ASE_DIR .. "/voti_" .. name .. "_nobg.aseprite"
  spr:saveAs(ase_path)

  -- Export spritesheet
  app.command.ExportSpriteSheet{
    ui = false,
    type = SpriteSheetType.HORIZONTAL,
    textureFilename = SPRITES_OUT .. "/voti_" .. name .. ".png",
    dataFilename = SPRITES_OUT .. "/voti_" .. name .. ".json",
    dataFormat = SpriteSheetDataFormat.JSON_ARRAY,
    filenameFormat = "{title} {frame}.aseprite",
    trimSprite = false,
    extrude = false,
    listTags = true,
  }

  print("  OK: " .. #spr.frames .. " frames, " .. dur_ms .. "ms, tag=" .. tag_name .. " (" .. tag_dir .. ")")
  spr:close()
end

-- ===== ANIMATIONS (6 frames each) =====
local anim_configs = {
  { name="idle_half_blink",    tag="idle",         dir="pingpong", dur=180 },
  { name="happy_talking",      tag="happy_talk",   dir="forward",  dur=150 },
  { name="happy_celebrating",  tag="celebrate",    dir="pingpong", dur=130 },
  { name="thinking_squint",    tag="think",        dir="pingpong", dur=200 },
  { name="thinking_worried",   tag="think_worry",  dir="pingpong", dur=200 },
  { name="explaining_talking", tag="explain",      dir="forward",  dur=150 },
  { name="explaining_side",    tag="explain_side", dir="forward",  dur=150 },
  { name="loading_patient",    tag="loading",      dir="forward",  dur=160 },
  { name="loading_worried",    tag="load_worry",   dir="forward",  dur=160 },
  { name="open_eyes_neutral",  tag="neutral",      dir="pingpong", dur=170 },
}

print("=== Building 10 animations ===\n")
for _, cfg in ipairs(anim_configs) do
  local paths = {}
  for i = 1, 6 do
    paths[i] = BASE .. "/animations/" .. cfg.name .. "/frame" .. i .. ".png"
  end
  build_and_polish(cfg.name, paths, cfg.tag, cfg.dir, cfg.dur)
end

-- ===== TURNAROUNDS (16 frames each) =====
print("\n=== Building 2 turnarounds ===\n")

local body_files = {}
local head_files = {}
local angles = {0, 22, 45, 67, 90, 112, 135, 157, 180, 202, 225, 247, 270, 292, 315, 337}
for i, a in ipairs(angles) do
  body_files[i] = BASE .. "/fullbody/body_" .. a .. "deg.png"
  head_files[i] = BASE .. "/head/head_" .. a .. "deg.png"
end

build_and_polish("body_turnaround", body_files, "rotate", "forward", 150)
build_and_polish("head_turnaround", head_files, "rotate", "forward", 150)

print("\n=== ALL DONE — 12 sprites polished ===")
