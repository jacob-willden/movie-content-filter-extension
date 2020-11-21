=begin
Copyright 2010, Roger Pack 
This file is part of Sensible Cinema.

    Sensible Cinema is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Sensible Cinema is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Sensible Cinema.  If not, see <http://www.gnu.org/licenses/>.
=end
puts 'warning--using fake blanker'

class Blanker 
  
  def self.startup
  end
  def self.shutdown
  end
  
  def self.blank_full_screen! text
      puts 'the screen is now...blank!'
  end
  
  def self.unblank_full_screen!
      puts 'the screen is now...visible!'
  end
  
end