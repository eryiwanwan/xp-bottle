"""生成 OG 分享预览图（1200×630）。改完文案后重跑一次即可。"""

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
BG = (250, 247, 242)
INK = (58, 55, 51)
INK2 = (107, 102, 93)
INK3 = (169, 162, 150)
ACCENT = (153, 53, 86)

PINK = {2: (220, 214, 202), 3: (244, 192, 209), 4: (212, 83, 126), 5: (153, 53, 86)}

BOLD = "C:/Windows/Fonts/msyhbd.ttc"
REG = "C:/Windows/Fonts/msyh.ttc"


def font(path, size):
    return ImageFont.truetype(path, size)


def bottle(img, cx, base_y, w, h, r, level, color=INK, glass=(255, 255, 255)):
    """在 (cx, base_y) 处画一只瓶子，液体按 level 灌满。"""
    x0, y0 = cx - w // 2, base_y - h

    # 瓶身遮罩
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=r, fill=255)

    # 玻璃底色
    glass_layer = Image.new("RGBA", (w, h), glass + (150,))
    img.paste(glass_layer, (x0, y0), mask)

    # 液体
    if level > 0:
        lh = max(2, int((h - 6) * level))
        liq = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        ImageDraw.Draw(liq).rectangle([0, h - lh - 3, w, h], fill=color + (255,))
        liq.putalpha(Image.composite(liq.split()[3], Image.new("L", (w, h), 0), mask))
        img.paste(liq, (x0, y0), liq)

    d = ImageDraw.Draw(img)
    # 瓶口 + 瓶盖
    nw = max(14, int(w * 0.34))
    d.rounded_rectangle([cx - nw // 2, y0 - 26, cx + nw // 2, y0 + 8],
                        radius=5, outline=INK, width=3, fill=BG)
    d.rounded_rectangle([cx - nw // 2 - 7, y0 - 38, cx + nw // 2 + 7, y0 - 22],
                        radius=4, fill=INK)
    # 瓶身描边（最后画，压住液体边缘）
    d.rounded_rectangle([x0, y0, x0 + w - 1, base_y], radius=r, outline=INK, width=3)


img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# 顶部标签
d.text((72, 78), "18+  ·  成人内容", font=font(REG, 20), fill=INK3)

# 主标题（两行）
f_title = font(BOLD, 86)
d.text((68, 122), "小妈的", font=f_title, fill=INK)
d.text((68, 220), "性癖之瓶", font=f_title, fill=INK)

# 副标
d.text((72, 356), "35 张卡。左滑不行，右滑想要，上划跳过。", font=font(REG, 27), fill=INK2)
d.text((72, 400), "别想太久，第一反应比斟酌准。", font=font(REG, 27), fill=INK2)

# 署名
d.text((72, 520), "制作者：X · 小妈不是妈 @eryiwanwan", font=font(REG, 21), fill=INK3)

# 底部一排瓶子
base = 596
shelf = [
    (742, 74, 148, 16, 0, 0),      # 空
    (832, 88, 180, 20, 2, 0.22),   # 抵触（灰）
    (930, 82, 168, 18, 3, 0.42),   # 好奇
    (1030, 96, 200, 22, 4, 0.72),  # 喜欢
    (1128, 78, 160, 16, 5, 1.0),   # 满溢
]
for cx, w, h, r, lv, ratio in shelf:
    if lv == 0:
        d.rounded_rectangle([cx - w // 2, base - h, cx + w // 2, base],
                            radius=r, outline=(201, 196, 184), width=3)
        d.line([cx - w // 2 + 22, base - h + 26, cx + w // 2 - 22, base - 26],
               fill=(220, 200, 200), width=3)
        d.line([cx + w // 2 - 22, base - h + 26, cx - w // 2 + 22, base - 26],
               fill=(220, 200, 200), width=3)
        nw = max(14, int(w * 0.34))
        d.rounded_rectangle([cx - nw // 2, base - h - 26, cx + nw // 2, base - h + 8],
                            radius=5, outline=(201, 196, 184), width=3, fill=BG)
    else:
        bottle(img, cx, base, w, h, r, ratio, PINK[lv])

# 桌面线
d.line([700, base + 2, 1175, base + 2], fill=(228, 222, 210), width=2)

img.save("og.png", "PNG", optimize=True)
print("og.png", img.size)
