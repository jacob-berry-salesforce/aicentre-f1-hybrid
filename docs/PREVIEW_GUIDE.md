# Ultra-wide Screen Preview Guide

## Viewing the 5120x1440 Sim Attract Screen on MacBook Pro

The sim attract screens are designed for ultra-wide 5120x1440 resolution displays. To preview them on your MacBook Pro during development, use the **preview mode**.

### Preview Mode URLs

Add `?preview=true` to the URL to enable scaled-down preview mode:

**Simulator 1 (Left):**
```
http://localhost:3000/sim-attract.html?rig=1&preview=true
```

**Simulator 2 (Right):**
```
http://localhost:3000/sim-attract.html?rig=2&preview=true
```

### What Preview Mode Does

- Scales the entire 5120x1440 screen down to **25%** of original size
- Fits approximately 1280x360 pixels on your screen
- Maintains original layout and proportions
- Allows you to see the full design without scrolling

### Full Size URLs (for actual ultra-wide displays)

**Simulator 1:**
```
http://localhost:3000/sim-attract.html?rig=1
```

**Simulator 2:**
```
http://localhost:3000/sim-attract.html?rig=2
```

### Screen Layout

**NEW FLIPPED LAYOUT - Video on sides, 2x2 grid in center:**

```
┌────────────────────────┬───────────────────────────────────┬────────────────────────┐
│   LEFT (30%)           │        CENTER (40%)               │   RIGHT (30%)          │
│   VIDEO                │        CONTENT GRID               │   VIDEO                │
├────────────────────────┼───────────────────────────────────┼────────────────────────┤
│                        │ ┌─────────────┬─────────────────┐ │                        │
│                        │ │ SF+F1 Logo  │ 🏎️ Simulator 1 │ │                        │
│                        │ │             │ LEFT            │ │                        │
│   F1 Video             │ └─────────────┴─────────────────┘ │   F1 Video             │
│   Background           │                                   │   Background           │
│   (Darkened)           │ ┌─────────────┬─────────────────┐ │   (Offset 50%)         │
│   Starts at 0:00       │ │ Scan to     │ 🇲🇽 Mexico City │ │   Starts at 50%        │
│                        │ │ Race        │ Track of Week   │ │                        │
│                        │ │ [QR Code]   │                 │ │                        │
│                        │ │             │ 🏆 Top Times    │ │                        │
│                        │ │ 1. Scan     │ 1. James        │ │                        │
│                        │ │ 2. Enter    │ 2. Sarah        │ │                        │
│                        │ │ 3. Race!    │ 3. Michael      │ │                        │
│                        │ │             │ 4. Emma         │ │                        │
│                        │ │             │ 5. David        │ │                        │
│                        │ └─────────────┴─────────────────┘ │                        │
│                        │                                   │                        │
└────────────────────────┴───────────────────────────────────┴────────────────────────┘
```

### Development Tips

1. **Use Preview Mode** - Always develop with `?preview=true` on your MacBook
2. **Browser Zoom** - You can further zoom in/out in your browser if needed
3. **Full Screen Test** - Press F11 or use browser full-screen mode for better preview
4. **Responsive DevTools** - Open Chrome DevTools and set custom resolution to 5120x1440 to see actual size (requires scrolling)

### Other Screens

**Host Dashboard (55" 4K TV):**
```
http://localhost:3000/
```

The host dashboard is designed for standard 16:9 displays and doesn't need preview mode.

---

## Current Features

✅ QR code in left sidebar (fake placeholder for now)
✅ Player status indicator when someone registers
✅ F1 video background with branding
✅ Track of the week display
✅ Top 5 leaderboard
✅ Background music (F1 theme)
✅ Preview mode for development

## Next Steps

When ready to use real QR codes:
1. Uncomment the QR code generation code in [sim-attract.js](server/public/sim-attract.js:104-123)
2. Remove or hide the fake SVG QR code in the HTML
