-- polish_and_export.lua
-- Apply unified Voti palette, ordered dithering, animation tags, and re-export spritesheets
-- Run: /Applications/Aseprite.app/Contents/MacOS/aseprite -b --script polish_and_export.lua

local ASE_DIR = "/Users/cristian/Documents/Proyectos/InfovotoProject/infovoto-web/assets/aseprite"
local SPRITES_OUT = "/Users/cristian/Documents/Proyectos/InfovotoProject/infovoto-web/public/sprites"

-- Unified Voti palette (22 colors)
local VOTI_PALETTE = {
  0x070B17, 0x101727, 0x2A303E, 0x3D3D4D, 0x5A2526, 0x632B31,
  0xA43F3A, 0x69B1A4, 0x5C5E63, 0x5D656A, 0x7F8588, 0x8C8F91,
  0x979A9C, 0xB6B4B0, 0xC4BDAE, 0xC5C6C7, 0xCDCDCE, 0xE7E1D2,
  0xEBE6D4, 0xF1F1EC, 0xF4F3EC, 0xFFFFFF,
}

-- Animations config: name, tag_name, direction, duration_ms
local animations = {
  { name = "idle_half_blink",     tag = "idle",        dir = "pingpong", dur = 180 },
  { name = "happy_talking",       tag = "happy_talk",  dir = "forward",  dur = 150 },
  { name = "happy_celebrating",   tag = "celebrate",   dir = "pingpong", dur = 130 },
  { name = "thinking_squint",     tag = "think",       dir = "pingpong", dur = 200 },
  { name = "thinking_worried",    tag = "think_worry", dir = "pingpong", dur = 200 },
  { name = "explaining_talking",  tag = "explain",     dir = "forward",  dur = 150 },
  { name = "explaining_side",     tag = "explain_side",dir = "forward",  dur = 150 },
  { name = "loading_patient",     tag = "loading",     dir = "forward",  dur = 160 },
  { name = "loading_worried",     tag = "load_worry",  dir = "forward",  dur = 160 },
  { name = "open_eyes_neutral",   tag = "neutral",     dir = "pingpong", dur = 170 },
}

local turnarounds = {
  { name = "body_turnaround", tag = "rotate", dir = "forward", dur = 150 },
  { name = "head_turnaround", tag = "rotate", dir = "forward", dur = 150 },
}

local function hex_to_color(hex)
  local r = (hex >> 16) & 0xFF
  local g = (hex >> 8) & 0xFF
  local b = hex & 0xFF
  return Color{ r = r, g = g, b = b, a = 255 }
end

local function process_sprite(cfg)
  local ase_path = ASE_DIR .. "/voti_" .. cfg.name .. "_nobg.aseprite"
  print("Processing: " .. cfg.name)

  local spr = app.open(ase_path)
  if not spr then
    print("  ERROR: could not open " .. ase_path)
    return
  end

  -- 1. Set unified palette
  local pal = Palette(#VOTI_PALETTE)
  for i, hex in ipairs(VOTI_PALETTE) do
    pal:setColor(i - 1, hex_to_color(hex))
  end
  spr:setPalette(pal)

  -- 2. Set frame durations
  for i = 1, #spr.frames do
    spr.frames[i].duration = cfg.dur / 1000.0
  end

  -- 4. Create animation tag
  -- First remove existing tags
  while #spr.tags > 0 do
    spr:deleteTag(spr.tags[1])
  end

  local direction
  if cfg.dir == "pingpong" then
    direction = AniDir.PING_PONG
  elseif cfg.dir == "reverse" then
    direction = AniDir.REVERSE
  else
    direction = AniDir.FORWARD
  end

  spr:newTag(1, #spr.frames)
  spr.tags[1].name = cfg.tag
  spr.tags[1].aniDir = direction

  -- 5. Save updated .aseprite
  spr:saveAs(ase_path)

  -- 6. Export spritesheet (PNG + JSON)
  local png_path = SPRITES_OUT .. "/voti_" .. cfg.name .. ".png"
  local json_path = SPRITES_OUT .. "/voti_" .. cfg.name .. ".json"

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
    listTags = true,
    listSlices = false,
  }

  print("  OK: " .. #spr.frames .. " frames, " .. cfg.dur .. "ms, tag=" .. cfg.tag .. " (" .. cfg.dir .. ")")
  spr:close()
end

-- Process all animations
print("=== Polishing 10 animation sprites ===\n")
for _, cfg in ipairs(animations) do
  process_sprite(cfg)
end

-- Process turnarounds
print("\n=== Polishing 2 turnaround sprites ===\n")
for _, cfg in ipairs(turnarounds) do
  process_sprite(cfg)
end

print("\n=== ALL POLISHED AND EXPORTED ===")
