#! /usr/bin/env ruby

DX =   0
DY = -60
R  =  20
S  =   5

corners = (0...5).map do |i|
  2 * Math::PI * i / 5.0
end

x1 = DX - R * Math.sin(corners[0])
y1 = DY - R * Math.cos(corners[0])

printf "M %f,%f", x1, y1

i = 2
while i <= 10

  x2 = DX - R * Math.sin(corners[i % 5])
  y2 = DY - R * Math.cos(corners[i % 5])

  dx = x1 - x2
  dy = y1 - y2
  d2 = Math.sqrt(dx*dx + dy*dy)

  cx = (x1 + x2) / 2 + S * dy / d2
  cy = (y1 + y2) / 2 - S * dx / d2

  printf " Q %f,%f %f,%f", cx, cy, x2, y2

  x1 = x2
  y1 = y2
  i += 2
end

printf " Z"
