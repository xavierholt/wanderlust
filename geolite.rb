#! /usr/bin/env ruby
require 'json'

def format(rings)
  rings.map do |ring|
    ring.pop
    ring.map do |point|
      sprintf "%.5f,%.5f", *point
    end.join(' ')
  end.join(';').to_json
end

data = JSON.parse(File.read(ARGV[0]))
data['features'].sort_by! {|f| f['properties']['name']}

puts "{polygons: [{"
data['features'].each do |feature|
  name = feature['properties']['name']
  area = feature['properties']['area']
  geom = feature['geometry']['coordinates']
  type = feature['geometry']['type']

  if type == 'Polygon'
    puts "name: #{name.to_json},"
    puts "area: #{area.to_json},"
    puts "poly: #{format(geom)}"
    puts "},{" unless feature == data['features'].last
  else
    $stderr.puts "#{name} is a #{type}, not a Polygon.  Skipping..."
  end
end
puts "}]}"
