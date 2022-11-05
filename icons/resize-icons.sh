#!/bin/bash

# resize icons
convert "icon-512.png" -write mpr:image +delete \
\( mpr:image -resize 192x +write "icon-192.png" \) \
\( mpr:image -resize 128x +write "icon-128.png" \) \
\( mpr:image -resize 96x +write "icon-96.png" \) \
\( mpr:image -resize 48x +write "icon-48.png" \) \
\( mpr:image -resize 32x +write "icon-32.png" \) \
\( mpr:image -resize 16x +write "icon-16.png" \) \
null:

# round corners
# keep 512 as is, it is used only for transformations
sizes=( 192 128 96 48 32 16 )
borders=( 10 6 4 3 2 1 )
length=${#sizes[@]}
for ((l=0; l<length; l++)) do
  s=${sizes[$l]}
  b=${borders[$l]}

  # convert -size "$(($s))x$(($s))" xc:none -draw "roundRectangle 0,0,$(($s-1)),$(($s-1)),$(($b)),$(($b))" "mask-$s.png"
  # convert "icon-$s.png" -matte "mask-$s.png" -compose DstIn -composite "rounded-$s.png"

  convert -size "$(($s))x$(($s))" xc:none -draw "roundRectangle 0,0,$(($s-1)),$(($s-1)),$(($b)),$(($b))" png:- | convert "icon-$s.png" -matte - -compose DstIn -composite "icon-$s.png"
done


