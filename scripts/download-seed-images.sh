#!/usr/bin/env bash
# 批量下载种子数据商品图（Pexels 公共图库，免费可商用）
# 用法: bash scripts/download-seed-images.sh
set -u

DEST="$(cd "$(dirname "$0")/.." && pwd)/mall/src/main/resources/static/images/products"
mkdir -p "$DEST"
Q="?auto=compress&cs=tinysrgb&w=800"

# 文件名|Pexels photo id
LIST="
phone-honor.jpg|30930310
phone-oppo.jpg|4884123
phone-vivo.jpg|3850561
phone-iphone.jpg|47261
watch-huawei.jpg|5081914
watch-apple.jpg|5083218
headphone-sony.jpg|3394650
earbuds-xiaomi.jpg|11945638
mouse-logitech.jpg|16645416
laptop-lenovo.jpg|6968164
shirt-men.jpg|16062780
hoodie-men.jpg|5447916
dress-women.jpg|8619007
sweater-women.jpg|8386652
down-jacket.jpg|30953656
sneakers-canvas.jpg|6961151
running-shoes.jpg|34003822
loafers.jpg|37813631
nuts.jpg|11413390
bread.jpg|7543099
chips.jpg|32457159
coffee.jpg|33015766
rice.jpg|36346840
grains.jpg|4110255
oats.jpg|4110250
cherries.jpg|3084068
apples.jpg|30893357
pineapple.jpg|37065935
bedding.jpg|9893931
towel.jpg|22711513
wok.jpg|2868977
cooker.jpg|12156176
serum.jpg|7691098
face-mask.jpg|7691112
lipstick.jpg|2866796
foundation.jpg|4202325
yoga-mat.jpg|4716814
dumbbell.jpg|40371837
backpack.jpg|9629915
"

ok=0; fail=0
for row in $LIST; do
  name="${row%%|*}"
  id="${row##*|}"
  url="https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg${Q}"
  code=$(curl -sL -m 45 -o "$DEST/$name" -w "%{http_code}" "$url")
  size=$(stat -c %s "$DEST/$name" 2>/dev/null || echo 0)
  if [ "$code" = "200" ] && [ "$size" -gt 8000 ]; then
    ok=$((ok+1))
    printf "OK   %-22s %8s bytes\n" "$name" "$size"
  else
    fail=$((fail+1))
    rm -f "$DEST/$name"
    printf "FAIL %-22s http=%s size=%s\n" "$name" "$code" "$size"
  fi
done

echo "-----------------------------------------"
echo "成功 $ok 张，失败 $fail 张 -> $DEST"
