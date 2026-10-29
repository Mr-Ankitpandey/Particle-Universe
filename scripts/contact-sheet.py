from PIL import Image,ImageOps,ImageDraw
from pathlib import Path
root=Path('screenshots/phase-2')
canvas=Image.new('RGB',(1440,660),'#03030a')
draw=ImageDraw.Draw(canvas)
for i,name in enumerate(['attract','repel','swirl','shockwave','supernova','pan']):
 im=Image.open(root/(name+'.png')).convert('RGB');im.thumbnail((480,300));x=(i%3)*480;y=(i//3)*330;canvas.paste(im,(x,y+25));draw.text((x+12,y+6),name.upper(),fill='#e8e6ff')
canvas.save(root/'tools.png')
