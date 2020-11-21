#
# warning: somewhat scary/explicit down there!
# see also todo.subtitle file, though what's here is mostly pretty well functional/complete
#
begin
  require 'sane'
rescue LoadError
  require 'rubygems'
  require 'sane'
end
require_relative 'edl_parser'
require 'ostruct'

module SubtitleProfanityFinder
   @@expected_min_size = 10 # so unit tests can change it
   def self.expected_min_size= new_min
     @@expected_min_size = new_min
   end

   # splits into timestamps -> timestamps\ncontent blocks
   def self.split_to_entries subtitles_raw_text
      p subtitles_raw_text.valid_encoding?
     all = subtitles_raw_text.gsub("\r\n", "\n").scan(/^\d+\n\d\d:\d\d:\d\d.*?^$/m) # gsub line endings so that it parses right when linux reads a windows file <huh?>
     all.map!{|glop|
       lines = glop.lines.to_a
       index_line = lines[0]
       timing_line = lines[1].strip
       text = lines.to_a[2..-1].join("") # they still have separating "\n"'s
       # create english-ified version
       text.gsub!(/<(.|)(\/|)i>/i, '') # kill <i> type things
       text.gsub!(/[^a-zA-Z0-9\-!,.\?'\n\(\)]/, ' ') # kill weird stuff like ellipseses, also quotes would hurt so kill them too
       text.gsub!(/  +/, ' ') # remove duplicate "  " 's now since we may have inserted many
       # extract timing info
       # "00:03:00.0" , "00:04:00.0", "violence", "of some sort",
       timing_line =~ /((\d\d:\d\d:\d\d),(\d\d\d) --> (\d\d:\d\d:\d\d),(\d\d\d))/
       ts_begin = "#{$2}.#{$3}"
       ts_end =  "#{$4}.#{$5}"
       out = OpenStruct.new
	   out.index_number = index_line.strip.to_i
       out.beginning_time = EdlParser.translate_string_to_seconds ts_begin
       out.ending_time = EdlParser.translate_string_to_seconds ts_end
       out.text = text.strip # harmless right?
       add_single_line_minimized_text_from_multiline out
       out
     }
     if all.size < @@expected_min_size
       raise "unable to parse subtitle file? size=#{all.size}"
     end

     # strip out auto inserted trailers/headers
     reg =  / by|download| eng|www|http|sub/i
     while all[0].text =~ reg
      all.shift
     end
     while all[-1] =~ reg
      all.pop
     end
     all
   end

   def self.add_single_line_minimized_text_from_multiline entry
     entry.single_line_text = entry.text.strip.gsub(/^[- ,_\.]+/, '').gsub(/[- ,_]+$/, '').gsub(/[\r\n]/, ' ')
   end

   # convert string to regexp, also accomodating for "full word" type profanities
   def self.convert_to_regexps profanity_hash
    all_profanity_combinations = []
    profanity_hash.to_a.sort.reverse.each{|profanity, sanitized|
      as_regexp = Regexp.new(profanity, Regexp::IGNORECASE)
      if sanitized.is_a? Array
        # like 'bad word' => ['vain use', :partial_word, 'deity']
        raise unless sanitized.length.in? [2, 3]
        raise unless sanitized[1].in? [:full_word, :partial_word]
        is_single_word_profanity = true if sanitized[1] == :full_word
        if sanitized.length == 3
          category = sanitized[2]
        end
        sanitized = sanitized[0]
      end
      
      permutations = [profanity]
      if profanity =~ /l/
        permutations << profanity.gsub(/l/i, 'i')
      end
      if profanity =~ /i/
        permutations << profanity.gsub(/i/i, 'l')
      end
      
      replace_with = '[' + sanitized + ']'
      category ||= sanitized
      
      for permutation in permutations
        if is_single_word_profanity
		  # \s is whitespace
          as_regexp = Regexp.new("(?:\s|^|[^a-zA-Z])" + permutation + "(?:\s|$|[^a-zA-Z])", Regexp::IGNORECASE)
          all_profanity_combinations << [as_regexp, category, ' ' + replace_with + ' '] # might introduce an extra space in there, but that's prolly ok since they're full-word already, and we collapse them
        else
          all_profanity_combinations << [as_regexp, category, replace_with]
        end
      end
    }
    all_profanity_combinations
  end

  def self.edl_output incoming_filename, extra_profanity_hash = {}, subtract_from_each_beginning_ts = 0, add_to_end_each_ts = 0, 
               beginning_srt = 0.0, beginning_actual_movie = 0.0, ending_srt = 7200.0, ending_actual = 7200.0
    # jruby is unkind to invalid encoding input, and these can come from "all over" unfortunately, and it doesn't guess it right [?] ai ai so scrub
    contents = File.read(incoming_filename)
    edl_output_from_string(contents, extra_profanity_hash, subtract_from_each_beginning_ts, add_to_end_each_ts, beginning_srt, beginning_actual_movie, ending_srt, ending_actual)[0]
  end
  
  # **_time parameters are expected to be floats...
  def self.edl_output_from_string subtitles, extra_profanity_hash, subtract_from_each_beginning_ts, add_to_end_each_ts, starting_time_given_srt, starting_time_actual, ending_srt_time, ending_actual_time, include_minor_profanities=true # lodo may not need include_minor_profs :P
     raise if subtract_from_each_beginning_ts < 0 # these have to be positive...in my twisted paradigm
     raise if add_to_end_each_ts < 0
     subtitles = subtitles.scrub # invalid UTF-8 creeps in at times... ruby 2.1+

#     you minus the initial srt time... (given) then
#     ratio = (end actual - init actual/ end given - init given)*(how far you are past the initial srt) plus initial actual
     multiply_by_this_factor = (ending_actual_time - starting_time_actual)/(ending_srt_time - starting_time_given_srt)

     multiply_proc = proc {|you|
      ((you - starting_time_given_srt) * multiply_by_this_factor) + starting_time_actual
    }  





























    bad_profanities = {'hell' => ['h...', :full_word],
      'g' +
      111.chr + 
      100.chr => ['___', :partial_word, 'deity'], 'g' +
      111.chr + 
      100.chr +
      's' => 'deitys',
      'meu deus' => 'l...',
      'lo' + 
	  'rd' => 'l...', 'da' +
      'mn' => 'd...', 
      'f' +
      117.chr +
      99.chr +
      107.chr =>
      'f...',
      'allah' => 'all..',
      'bi' +
      'tc' + 104.chr => 'b....',
      'bas' +
      'ta' + 
	  'r' + 100.chr => 'ba.....',
      ((arse = 'a' +
      's'*2)) => ['a..', :full_word],
      arse + 'h' +
      'ole' => 'a..h...',
      'dieu' => ['deity', :full_word],
      arse + 'w' +
      'ipe' => 'a..w...',
      'jes' +
      'u' + 's' => ['___', :partial_word, 'deity'],
      'chri' +
      'st'=> ['___', :full_word, 'deity'], # allow for christian[ity] 
      'sh' +
       'i' + 't' => 'sh..',
      'cu' +
      'nt' => 'c...',
      'cock' +
	  'su' + 
	  'cker' => 'cock......',
	  'bloody' => 'bloo..'
    }
	
    semi_bad_profanities = {}
    ['moron', 'breast', 'idiot', 
      'sex', 'genital', 
	  'naked', 
      'boob', 
      'tits',
      'make love', 'pen' +
	  'is',
      'pu' +
	  'ssy',
	  'gosh',
	  'whore',
	  'debauch',
      'come to bed',
      'lie with',
      'making' + 
	    ' love', 'love mak', 
      'dumb', 'suck', 'piss', 'c' +
	    'u' + 'nt',
	    'd' + 'ick', 'v' +
		'ag' +
	    'i' + 
		'na',
		'int' +
		'er' +
		'course'
	  ].each{|name|
      semi_bad_profanities[name] = name
    }
	
	for word in ['panties', 'crap', 'butt', 'dumb', 'fart']
	  semi_bad_profanities[word] = [word, :full_word]
	end
	
    semi_bad_profanities.merge! extra_profanity_hash

    all_profanity_combinationss = [convert_to_regexps(bad_profanities)]
    if include_minor_profanities
      all_profanity_combinationss += [convert_to_regexps(semi_bad_profanities)]
    end
    
    output = ''
    entries = split_to_entries(subtitles)
    for all_profanity_combinations in all_profanity_combinationss
      output += "\n" # some space between greater and lesser prof's
      for entry in entries
        text = entry.text
        ts_begin = entry.beginning_time

        ts_begin = multiply_proc.call(ts_begin)
        ts_begin -= subtract_from_each_beginning_ts
        
        ts_end = entry.ending_time
        ts_end = multiply_proc.call(ts_end)
        ts_end += add_to_end_each_ts
        found_category = nil
        for (profanity, category, sanitized) in all_profanity_combinations
          if text =~ profanity
            found_category = category
            break
          end
        end
        
        if found_category
          # sanitize/euphemize the subtitle text for all profanities...
          for all_profanity_combinations2 in all_profanity_combinationss
            for (profanity, category, sanitized) in all_profanity_combinations2
              text.gsub!(profanity, sanitized)
            end
          end
          
          # because we now have duplicate's for the letter l/i, refactor [[[word]]] to just [word]
          text.gsub!(/\[+/, '[')
          text.gsub!(/\]+/, ']')
          entry.text = text
          add_single_line_minimized_text_from_multiline entry
          text = text.gsub(/[\r\n]|\n/, ' ') # flatten up to 3 lines of text to just 1
          ts_begin_human = EdlParser.translate_time_to_human_readable ts_begin, true
          ts_end_human = EdlParser.translate_time_to_human_readable ts_end, true
          unless output.contain? ts_begin_human # i.e. some previous profanity already found this line :P
            output += %!  "#{ts_begin_human}" , "#{ts_end_human}", "profanity", "#{found_category}", "#{text}",\n!
          end
        end
      end
    end
    # update timestamps to be synchro'ed
    for entry in entries
      entry.beginning_time = multiply_proc.call(entry.beginning_time)
      entry.ending_time = multiply_proc.call(entry.ending_time)
    end
    [output.strip, entries]
  end
end

if $0 == __FILE__
  if ARGV.empty?
    p 'syntax: [filename.srt | [--create-edl|--create-edl-including-minor-profanities] input_name.srt output_name.edl]'
    exit
  elsif ARGV[0].in? ['--create-edl', '--create-edl-including-minor-profanities']
    require_relative 'mplayer_edl'
    incoming_filename = ARGV[1]
    include_minors = true if ARGV[0] == '--create-edl-including-minor-profanities'
    mutes = SubtitleProfanityFinder.edl_output_from_string File.read(incoming_filename), {}, 0, 0, "00:00", "00:00", "10:00:00", "10:00:00", include_minors
    specs = EdlParser.parse_string %!"mutes" => [#{mutes}]!
    File.write(ARGV[2], MplayerEdl.convert_to_edl(specs))
    puts "wrote to #{ARGV[2]}"
  else
    print SubtitleProfanityFinder.edl_output ARGV.first
  end
end
