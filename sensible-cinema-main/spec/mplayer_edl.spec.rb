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
require File.dirname(__FILE__) + "/common"
require_relative '../lib/mplayer_edl'

describe MplayerEdl do
  
  { "mutes" => {5=> 7}, "blank_outs" => {6=>7} }
  it "should translate verbatim" do
    a = MplayerEdl.convert_to_edl({ "mutes"=>{105=>145, "46:33.5"=>2801}, "blank_outs" => {6 => 7} } )
    # 0 for skip, 1 for mute
    a.should == <<-EOL
6.0 7.0 0
105.0 145.0 1
2793.5 2801.0 1
    EOL
  end
  
  it "should add to mutes" do
    a = MplayerEdl.convert_to_edl({ "mutes"=>{105=>106}, "blank_outs" => {110 => 111} }, 1 )
    a.should == <<-EOL
105.0 107.0 1
110.0 112.0 0
    EOL
  end

  it "should catch overlaps from additions to mutes" do
    pending do
      a = MplayerEdl.convert_to_edl({ "mutes"=>{105=>106}, "blank_outs" => {106 => 107} }, 1 )
      a.should == <<-EOL
105.0 106.0 1
106.0 107.0 0
      EOL
    end
  end

  it "should add to beginning and ending of mutes" do
    a = MplayerEdl.convert_to_edl({ "mutes"=>{105=>106}, "blank_outs" => {110 => 111} }, 1, 1 )
    a.should == <<-EOL
104.0 107.0 1
109.0 112.0 0
    EOL
  
  end
  
  it "should accomodate for unordered sections in some dvd's and order the output" do
    mplayer_dvd_splits = [103]
    a = MplayerEdl.convert_to_edl({ "mutes"=>{5=>6,105=>106}, "blank_outs" => {110 => 111}}, 0, 0, mplayer_dvd_splits )
    a.should == <<-EOL
1.0 4.0 1
5.0 6.0 1
6.0 9.0 0
    EOL
  end
  
  it "should use non additive mplayer_dvd_splits" do
    mplayer_dvd_splits = [103, 150]
    a = MplayerEdl.convert_to_edl({ "mutes"=>{5=>6,114=>115}}, 0, 0, mplayer_dvd_splits )
    a.should == <<-EOL
5.0 6.0 1
10.0 13.0 1
    EOL
  end
    
  it "should combine overlaps" do
    mplayer_dvd_splits = [103, 12]
    a = MplayerEdl.convert_to_edl({ "mutes"=>{5=>6, 105 => 106, 120=>121}}, 0, 0, mplayer_dvd_splits )
    a.should == <<-EOL
1.0 8.0 1
    EOL
    
  end
  
  it "should use non additive mplayer_dvd_splits 2" do
    mplayer_dvd_splits = [103, 47]
    a = MplayerEdl.convert_to_edl({ "mutes"=>{5=>6,124=>125, 185 => 190}}, 0, 0, mplayer_dvd_splits )
    a.should == <<-EOL
5.0 6.0 1
20.0 23.0 1
33.0 42.0 1
    EOL

  end
  
end