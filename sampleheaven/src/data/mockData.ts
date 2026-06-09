export interface Sample {
  id: string;
  title: string;
  creator: string;
  type: 'Loop' | 'One-Shot' | 'SFX' | 'MIDI' | 'Beat' | 'Pack' | 'Kit';
  genre: string;
  bpm: number | null;
  key: string | null;
  format: string;
  downloads: number;
  duration: string;
  fileSize: string;
  price?: number;
  audioUrl?: string; // fallback synthesiser tags
  coverArt?: string;
}

export interface Creator {
  username: string;
  samplesCount: number;
  followersCount: number;
  bio: string;
  avatarLetter: string;
}

export interface Pack {
  id: string;
  title: string;
  creator: string;
  samplesCount: number;
  downloadsCount: number;
  genre: string;
  description: string;
  price?: number;
  coverArt?: string;
  fileUrl?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: 'Production Tips' | 'Tutorial' | 'Spotlight' | 'News' | 'Tool Reviews';
  author: string;
  date: string;
  excerpt: string;
  readTime: string;
}

export const mockCreators: Creator[] = [
  { username: "KVNG Beats", samplesCount: 142, followersCount: 3200, bio: "Trap & hip-hop producer from Atlanta. Making beats since 2015.", avatarLetter: "K" },
  { username: "ChillWave", samplesCount: 89, followersCount: 2100, bio: "Lo-fi beats and jazzy textures. Coffee and vinyl vibes.", avatarLetter: "C" },
  { username: "SoundForge", samplesCount: 234, followersCount: 5800, bio: "Professional sound designer for film & TV. 10+ years experience.", avatarLetter: "S" },
  { username: "NebulaSounds", samplesCount: 67, followersCount: 1400, bio: "Ambient soundscapes and ethereal textures from outer space.", avatarLetter: "N" },
  { username: "VoxLab", samplesCount: 112, followersCount: 2900, bio: "Vocal processing wizard. Chops, harmonies, and FX.", avatarLetter: "V" },
  { username: "GrooveMaster", samplesCount: 78, followersCount: 1800, bio: "Funk, soul, and R&B grooves. All live-recorded instruments.", avatarLetter: "G" }
];

export const mockPacks: Pack[] = [
  { id: "pack-1", title: "Midnight Trap Essentials", creator: "KVNG Beats", samplesCount: 24, downloadsCount: 12400, genre: "Trap", description: "Hard-hitting 808s, snappy snares, clean hi-hat loops, and dark melody loops designed for modern trap production." },
  { id: "pack-2", title: "Lo-Fi Bedroom Sessions", creator: "ChillWave", samplesCount: 18, downloadsCount: 8900, genre: "Lo-Fi", description: "Dusty piano chords, vinyl crackle loops, jazzy basslines, and organic percussion to capture the classic bedroom aesthetic." },
  { id: "pack-3", title: "Cinematic Sound Design Vol.1", creator: "SoundForge", samplesCount: 32, downloadsCount: 15200, genre: "Cinematic", description: "Ethereal pads, massive sub impacts, tense risers, and sci-fi transitions suitable for composers and game sound developers." },
  { id: "pack-4", title: "Ambient Textures Collection", creator: "NebulaSounds", samplesCount: 20, downloadsCount: 6100, genre: "Ambient", description: "Slow evolving ambient drones, generative synth sequences, and natural field recordings for immersive sonic environments." }
];

export const mockSamples: Sample[] = [
  { id: "sample-1", title: "Midnight 808 Punch", creator: "KVNG Beats", type: "One-Shot", genre: "Trap", bpm: null, key: "C", format: "WAV", downloads: 14302, duration: "0:02", fileSize: "1.2 MB" },
  { id: "sample-2", title: "Lo-Fi Jazz Piano Loop", creator: "ChillWave", type: "Loop", genre: "Lo-Fi", bpm: 85, key: "Dm", format: "WAV", downloads: 9847, duration: "0:08", fileSize: "4.8 MB" },
  { id: "sample-3", title: "Cinematic Tension Riser", creator: "SoundForge", type: "SFX", genre: "Cinematic", bpm: null, key: null, format: "WAV", downloads: 7221, duration: "0:06", fileSize: "3.5 MB" },
  { id: "sample-4", title: "Trap Hi-Hat Pattern 01", creator: "808Mafia_Fan", type: "Loop", genre: "Trap", bpm: 140, key: null, format: "WAV", downloads: 12540, duration: "0:04", fileSize: "2.1 MB" },
  { id: "sample-5", title: "Ambient Pad - Ethereal", creator: "NebulaSounds", type: "Loop", genre: "Ambient", bpm: 70, key: "Gm", format: "FLAC", downloads: 5100, duration: "0:12", fileSize: "6.8 MB" },
  { id: "sample-6", title: "Funky Bass Groove", creator: "GrooveMaster", type: "Loop", genre: "R&B", bpm: 110, key: "Eb", format: "WAV", downloads: 6890, duration: "0:08", fileSize: "4.2 MB" },
  { id: "sample-7", title: "Vocal Chop - Heavenly", creator: "VoxLab", type: "One-Shot", genre: "Pop", bpm: null, key: "Ab", format: "MP3", downloads: 11200, duration: "0:03", fileSize: "0.8 MB" },
  { id: "sample-8", title: "Drill Slide Bass", creator: "UKDrillBeats", type: "One-Shot", genre: "Hip-Hop", bpm: null, key: "F", format: "WAV", downloads: 18700, duration: "0:02", fileSize: "1.4 MB" },
  { id: "sample-9", title: "Synthwave Arpeggio", creator: "RetroWaveX", type: "Loop", genre: "Electronic", bpm: 120, key: "Am", format: "WAV", downloads: 8330, duration: "0:08", fileSize: "4.5 MB" },
  { id: "sample-10", title: "Foley Rain on Window", creator: "FieldRecPro", type: "SFX", genre: "Foley", bpm: null, key: null, format: "WAV", downloads: 4560, duration: "0:15", fileSize: "8.1 MB" },
  { id: "sample-11", title: "Neo Soul Keys", creator: "KeysMaster", type: "Loop", genre: "Jazz", bpm: 95, key: "Bb", format: "WAV", downloads: 7100, duration: "0:08", fileSize: "4.3 MB" },
  { id: "sample-12", title: "Future Bass Chord Stack", creator: "WaveformX", type: "MIDI", genre: "Electronic", bpm: 150, key: "Cm", format: "MIDI", downloads: 9950, duration: "0:04", fileSize: "0.1 MB" },
  { id: "sample-13", title: "Acoustic Guitar Strum", creator: "StringTheory", type: "Loop", genre: "Pop", bpm: 100, key: "G", format: "WAV", downloads: 6400, duration: "0:06", fileSize: "3.2 MB" },
  { id: "sample-14", title: "Dark Ambient Drone", creator: "VoidSounds", type: "Loop", genre: "Ambient", bpm: 60, key: "Em", format: "FLAC", downloads: 3200, duration: "0:16", fileSize: "8.9 MB" },
  { id: "sample-15", title: "Boom Bap Drum Break", creator: "ClassicBeats", type: "Loop", genre: "Hip-Hop", bpm: 90, key: null, format: "WAV", downloads: 15800, duration: "0:08", fileSize: "4.4 MB" },
  { id: "sample-16", title: "Cinematic Whoosh", creator: "SoundForge", type: "SFX", genre: "Cinematic", bpm: null, key: null, format: "WAV", downloads: 22100, duration: "0:03", fileSize: "1.6 MB" }
];

export const mockBlogPosts: BlogPost[] = [
  { id: "post-1", title: "10 Tips for Chopping Samples Like a Pro", category: "Production Tips", author: "KVNG Beats", date: "May 28, 2026", excerpt: "Learn how to slice drum loops and melodic elements to create unique grooves. Improve your DAW sampling workflow.", readTime: "5 min read" },
  { id: "post-2", title: "The Ultimate Guide to Lo-Fi Production", category: "Tutorial", author: "ChillWave", date: "May 25, 2026", excerpt: "Step-by-step tutorial on designing dust, tape flutter, detuned keyboard progressions, and crunchy vinyl beats.", readTime: "8 min read" },
  { id: "post-3", title: "Creator Spotlight: SoundForge", category: "Spotlight", author: "SampleGoldmine", date: "May 22, 2026", excerpt: "We sit down with a film sound design veteran to talk field recording gear, synthesizer patches, and media licensing.", readTime: "6 min read" },
  { id: "post-4", title: "Free vs. Premium: Understanding Licensing", category: "News", author: "SampleGoldmine", date: "May 20, 2026", excerpt: "Everything you need to know about royalty-free vs commercial licenses, copyright strikes, and YouTube monetization safety.", readTime: "4 min read" },
  { id: "post-5", title: "How to Build Your Own Sample Pack", category: "Tutorial", author: "VoxLab", date: "May 18, 2026", excerpt: "Curating loops, cataloging keys/BPMs, compressing assets, and creating eye-catching covers to sell your packs.", readTime: "7 min read" },
  { id: "post-6", title: "Best Free DAWs for Beginners in 2026", category: "Tool Reviews", author: "SampleGoldmine", date: "May 15, 2026", excerpt: "A comprehensive roundup of free music production software, comparing features, built-in samplers, and VST support.", readTime: "5 min read" }
];
