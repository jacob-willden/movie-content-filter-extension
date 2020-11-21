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

if RUBY_PLATFORM !~ /java/
  require_relative 'fake_blanker'
else
  
  require 'java'
  
  class Blanker 
    JFrame = javax.swing.JFrame
    JLabel = javax.swing.JLabel

    def self.warmup
      # lodo does this really speed things up to pre-create it? that icon is a bit ugly in the taskbar...
      @fr = JFrame.new("Sensible Cinema blanker-outer overlay window")
      cover_entire_screen = java.awt.Toolkit.getDefaultToolkit().getScreenSize()
      @fr.set_size(cover_entire_screen)
      cp = @fr.getContentPane
      cp.setBackground(java.awt.Color.black);      
      
      @label = JLabel.new
      @label.set_text 'blanked'
      @fr.add(@label)
      @label.setForeground(java.awt.Color.white);
      @label.repaint
      @label.revalidate
      
      @fr.set_resizable(false)
      @fr.set_visible true
      unblank_full_screen! 
    end
    
    @@use_mouse = false # hard coded for now, to use change this value
    @@use_foreground_window_minimize = false
    
    if @@use_foreground_window_minimize
      require 'win32/screenshot'
      SW_MINIMIZE = 6
      def self.minimize_hwnd hwnd
        Win32::Screenshot::BitmapMaker.show_window(hwnd, SW_MINIMIZE)
      end
      def self.restore_hwnd hwnd
        Win32::Screenshot::BitmapMaker.restore(hwnd)
      end
    end
    

    def self.blank_full_screen! seconds
      p 'blanking'      
      if @@use_mouse
        p "using mouse click to blank"
        Mouse.single_click_left_mouse_button
      elsif @@use_foreground_window_minimize
        p 'using foreground window minimize to blank'
        @foreground_hwnd ||= Win32::Screenshot::BitmapMaker.foreground_window
        minimize_hwnd @foreground_hwnd
      else
        # somewhat hacky work around for doze: http://www.experts-exchange.com/Programming/Languages/Java/Q_22977145.html
        @fr.set_visible true
        @fr.setAlwaysOnTop(false) 
        @fr.setAlwaysOnTop(true)
        @fr.set_location(0,0)
        @fr.repaint # early paint, just in case that helps it pop up faster :)
        if seconds
          @label.set_text "   #{seconds} s" 
        else
          @label.set_text "  Blank section"
        end
      end
    end
    
    def self.unblank_full_screen!
      p 'unblanking'
      if @@use_mouse
        Mouse.single_click_left_mouse_button
      elsif @@use_foreground_window_minimize
        restore_hwnd @foreground_hwnd
      else
        # just move it off screen...lodo
        @fr.set_location(-2300, -2300)
        @fr.repaint 0
        @fr.set_visible false
        @label.set_text 'non-blanked--you should never see this'
      end
    end
    
    def self.shutdown
      @fr.dispose if @fr
    end
    
  end
  
end
