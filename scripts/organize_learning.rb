# Mechanical taxonomy assignment; established URLs and editorial review dates stay intact.
require 'yaml'
require 'json'
require 'fileutils'
require 'date'
root = File.expand_path('../docs', __dir__)
topics = JSON.parse(File.read(File.join(root, '_data/learning_topics.json')))
count = 0
Dir.glob(File.join(root, '**/*.md')).sort.each do |path|
  source = File.read(path, encoding: 'UTF-8')
  next unless source.start_with?("---\n", "---\r\n")
  parts = source.split(/^---\s*$\r?\n?/, 3)
  next unless parts.length == 3
  metadata = YAML.safe_load(parts[1], permitted_classes: [Date, Time], aliases: true) rescue nil
  next unless metadata.is_a?(Hash) && metadata['schema_type'] == 'Article'
  text = [metadata['permalink'], metadata['title']].join(' ').downcase
  topic = if path.include?('/api-evidence/') && %w[research sourcing creative].include?(metadata['topic'])
    metadata['topic']
  elsif text.match?(/1688|supplier|sourcing/)
    'sourcing'
  elsif %w[shopping seo visibility].include?(metadata['topic']) || text.match?(/seo|\bgeo\b|visibility|referral|shopping|search-console|ai-search|ai-discovery/)
    'visibility'
  elsif metadata['topic'] == 'creative' || text.match?(/video|image|veo|sora|kling|seedance|playground|flux/)
    'creative'
  elsif %w[api build agents].include?(metadata['topic']) || text.match?(/api|mcp|agent|resource-discovery/)
    'agents'
  else
    'research'
  end
  kind = if path.include?('/api-evidence/') then 'evidence'
    elsif path.include?('/case-studies/') || text.include?('case-study') then 'case-study'
    elsif path.include?('/alternatives/') then 'comparison'
    elsif path.include?('/ecommerce-trends/') then 'insight'
    else 'guide' end
  additions = { 'learning_topic' => topic, 'content_kind' => kind }.reject { |key, _| metadata.key?(key) }
  next if additions.empty?
  newline = source.include?("\r\n") ? "\r\n" : "\n"
  source = source.sub(/\A---\r?\n/, "---#{newline}" + additions.map { |k,v| "#{k}: #{v}#{newline}" }.join)
  File.write(path, source)
  count += 1
end
topics.each do |topic|
  directory = File.join(root, 'topics', topic['id'])
  FileUtils.mkdir_p(directory)
  path = File.join(directory, 'index.md')
  next if File.exist?(path)
  File.write(path, "---\nlayout: topic\ntitle: #{topic['title']} | Nexscope Learn\ndescription: #{topic['description']}\npermalink: /topics/#{topic['id']}/\nlearning_topic: #{topic['id']}\nstandalone_page: true\nlast_modified_at: 2026-10-27\n---\n")
end
puts "Assigned topic and content type to #{count} articles; ensured six topic hubs."
