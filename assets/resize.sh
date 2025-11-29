for size in 16 24 32 48 128; do                                       [13:10]
  magick source.png -fuzz 4% -transparent white -resize ${size}x${size} ${size}x${size}.png
done