import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RunwareResponse {
  data: Array<{
    taskType: string;
    taskUUID: string;
    imageURL: string;
    positivePrompt: string;
    seed: number;
    NSFWContent: boolean;
  }>;
}

const AVATAR_PROMPTS = [
  // Males - Young
  { id: 'yakuza_young_male_1', name: 'Ryu', description: 'Young yakuza apprentice', gender: 'male', age_group: 'young', prompt: 'Portrait of a young Japanese yakuza warrior, 25 years old, masculine face, traditional tattoos visible on neck, smoking a cigar, holding a premium wagyu steak, confident expression, dark suit, dramatic lighting, photorealistic' },
  { id: 'yakuza_young_male_2', name: 'Kazuki', description: 'Rising dragon warrior', gender: 'male', age_group: 'young', prompt: 'Portrait of a young Japanese yakuza, 23 years old, sharp eyes, dragon tattoo on forearm, cigar in mouth, raw wagyu beef in background, stern look, black leather jacket, moody atmosphere, photorealistic' },
  { id: 'yakuza_young_male_3', name: 'Hiroshi', description: 'Street-smart enforcer', gender: 'male', age_group: 'young', prompt: 'Portrait of a young yakuza warrior, 26 years old, slicked back hair, smoking cigar, premium beef cuts displayed, intense gaze, traditional Japanese suit, neon lighting, photorealistic' },
  { id: 'yakuza_young_male_4', name: 'Takeshi', description: 'Bold young lieutenant', gender: 'male', age_group: 'young', prompt: 'Portrait of a young Japanese yakuza, 24 years old, confident smirk, holding cigar and wagyu steak, sleeve tattoos, modern suit style, urban background, photorealistic' },
  { id: 'yakuza_young_male_5', name: 'Kenji', description: 'Ambitious newcomer', gender: 'male', age_group: 'young', prompt: 'Portrait of a young yakuza warrior, 22 years old, determined expression, cigar smoke swirling, high-quality beef on table, traditional tattoos, dark clothing, dramatic shadows, photorealistic' },

  // Males - Middle-aged
  { id: 'yakuza_middle_male_1', name: 'Satoshi', description: 'Seasoned captain', gender: 'male', age_group: 'middle', prompt: 'Portrait of a middle-aged Japanese yakuza warrior, 40 years old, weathered face, extensive traditional tattoos, smoking expensive cigar, grilling wagyu beef, authoritative presence, formal suit, dim lighting, photorealistic' },
  { id: 'yakuza_middle_male_2', name: 'Masato', description: 'Respected underboss', gender: 'male', age_group: 'middle', prompt: 'Portrait of a middle-aged yakuza, 42 years old, scarred face, full sleeve tattoos, cigar between teeth, premium meat cuts, serious expression, pinstripe suit, restaurant setting, photorealistic' },
  { id: 'yakuza_middle_male_3', name: 'Noboru', description: 'Strategic commander', gender: 'male', age_group: 'middle', prompt: 'Portrait of a middle-aged Japanese yakuza warrior, 38 years old, calculating eyes, traditional irezumi tattoos, enjoying cigar with wagyu dinner, commanding presence, expensive suit, warm lighting, photorealistic' },
  { id: 'yakuza_middle_male_4', name: 'Ichiro', description: 'Veteran enforcer', gender: 'male', age_group: 'middle', prompt: 'Portrait of a middle-aged yakuza, 45 years old, battle-hardened face, intricate tattoos, smoking cigar while preparing beef, intimidating aura, traditional Japanese clothing, kitchen background, photorealistic' },

  // Males - Old
  { id: 'yakuza_old_male_1', name: 'Oyabun Tanaka', description: 'Elder patriarch', gender: 'male', age_group: 'old', prompt: 'Portrait of an elderly Japanese yakuza patriarch, 65 years old, wise weathered face, full-body traditional tattoos, smoking premium cigar, examining finest wagyu, dignified presence, formal kimono, traditional setting, photorealistic' },
  { id: 'yakuza_old_male_2', name: 'Elder Yamamoto', description: 'Legendary boss', gender: 'male', age_group: 'old', prompt: 'Portrait of an old yakuza warrior, 70 years old, silver hair, ceremonial tattoos, cigar in hand, wagyu feast before him, commanding respect, traditional Japanese suit, golden hour lighting, photorealistic' },
  { id: 'yakuza_old_male_3', name: 'Master Sato', description: 'Revered elder', gender: 'male', age_group: 'old', prompt: 'Portrait of an elderly Japanese yakuza, 68 years old, distinguished features, ancient tattoo art, smoking cigar contemplatively, surrounded by premium beef, sage-like wisdom, traditional attire, temple atmosphere, photorealistic' },

  // Females - Young
  { id: 'yakuza_young_female_1', name: 'Akira', description: 'Fierce young warrior', gender: 'female', age_group: 'young', prompt: 'Portrait of a young Japanese yakuza woman warrior, 24 years old, strong feminine features, delicate tattoos on shoulders, smoking cigar confidently, holding premium wagyu, fierce expression, elegant suit, neon backdrop, photorealistic' },
  { id: 'yakuza_young_female_2', name: 'Yuki', description: 'Rising dragon lady', gender: 'female', age_group: 'young', prompt: 'Portrait of a young female yakuza, 26 years old, sharp intelligent eyes, cherry blossom tattoos, cigar between lips, preparing wagyu beef, determined look, modern business attire, urban setting, photorealistic' },
  { id: 'yakuza_young_female_3', name: 'Rei', description: 'Bold lieutenant', gender: 'female', age_group: 'young', prompt: 'Portrait of a young Japanese yakuza woman, 25 years old, confident smile, traditional koi tattoos, enjoying cigar with wagyu meal, strong presence, stylish clothing, restaurant ambiance, photorealistic' },

  // Females - Middle-aged
  { id: 'yakuza_middle_female_1', name: 'Michiko', description: 'Respected captain', gender: 'female', age_group: 'middle', prompt: 'Portrait of a middle-aged Japanese yakuza woman warrior, 40 years old, elegant mature features, sophisticated tattoo work, smoking expensive cigar, examining prime wagyu, authoritative grace, formal business suit, upscale setting, photorealistic' },
  { id: 'yakuza_middle_female_2', name: 'Sayuri', description: 'Strategic underboss', gender: 'female', age_group: 'middle', prompt: 'Portrait of a middle-aged female yakuza, 38 years old, calculating gaze, artistic tattoos, cigar in hand, wagyu steaks on grill, commanding respect, designer clothing, modern kitchen, photorealistic' },

  // Females - Old
  { id: 'yakuza_old_female_1', name: 'Grandmother Tanaka', description: 'Elder matriarch', gender: 'female', age_group: 'old', prompt: 'Portrait of an elderly Japanese yakuza matriarch, 68 years old, dignified aged beauty, traditional full-body tattoos, smoking ceremonial cigar, overseeing wagyu preparation, regal presence, traditional kimono, temple setting, photorealistic' },
  { id: 'yakuza_old_female_2', name: 'Elder Matsuda', description: 'Wise advisor', gender: 'female', age_group: 'old', prompt: 'Portrait of an old female yakuza warrior, 65 years old, silver hair in elegant style, ancient tattoo artistry, contemplating with cigar, premium beef feast, sage wisdom, traditional Japanese clothing, golden lighting, photorealistic' },
  { id: 'yakuza_old_female_3', name: 'Master Nakamura', description: 'Legendary boss', gender: 'female', age_group: 'old', prompt: 'Portrait of an elderly Japanese yakuza woman, 70 years old, powerful aged features, ceremonial tattoos, cigar smoke around her, finest wagyu selection, intimidating respect, formal traditional dress, dramatic shadows, photorealistic' }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RUNWARE_API_KEY = Deno.env.get('RUNWARE_API_KEY');
    if (!RUNWARE_API_KEY) {
      throw new Error('RUNWARE_API_KEY is not set');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if avatars already exist
    const { data: existingAvatars } = await supabase
      .from('avatar_options')
      .select('id')
      .limit(1);

    if (existingAvatars && existingAvatars.length > 0) {
      return new Response(JSON.stringify({ 
        message: 'Avatars already generated',
        count: AVATAR_PROMPTS.length 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating avatars...');

    // Generate images using Runware API
    const generatedAvatars = [];

    for (const avatar of AVATAR_PROMPTS) {
      try {
        console.log(`Generating avatar: ${avatar.name}`);
        
        const response = await fetch('https://api.runware.ai/v1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([
            {
              taskType: 'authentication',
              apiKey: RUNWARE_API_KEY,
            },
            {
              taskType: 'imageInference',
              taskUUID: crypto.randomUUID(),
              positivePrompt: avatar.prompt,
              model: 'runware:100@1',
              width: 512,
              height: 512,
              numberResults: 1,
              outputFormat: 'WEBP',
              CFGScale: 1,
              scheduler: 'FlowMatchEulerDiscreteScheduler',
              strength: 0.8,
            }
          ])
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: RunwareResponse = await response.json();
        const imageData = result.data.find(item => item.taskType === 'imageInference');
        
        if (imageData && imageData.imageURL) {
          // Download the image
          const imageResponse = await fetch(imageData.imageURL);
          const imageBuffer = await imageResponse.arrayBuffer();
          
          // Upload to Supabase Storage
          const fileName = `${avatar.id}.webp`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, imageBuffer, {
              contentType: 'image/webp',
              cacheControl: '3600',
            });

          if (uploadError) {
            console.error(`Upload error for ${avatar.name}:`, uploadError);
            continue;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

          // Save avatar option to database
          const { error: dbError } = await supabase
            .from('avatar_options')
            .insert({
              id: avatar.id,
              name: avatar.name,
              description: avatar.description,
              image_url: publicUrl,
              gender: avatar.gender,
              age_group: avatar.age_group,
            });

          if (dbError) {
            console.error(`Database error for ${avatar.name}:`, dbError);
            continue;
          }

          generatedAvatars.push({
            id: avatar.id,
            name: avatar.name,
            url: publicUrl,
          });

          console.log(`✓ Generated avatar: ${avatar.name}`);
        }
      } catch (error) {
        console.error(`Error generating avatar ${avatar.name}:`, error);
        continue;
      }
    }

    return new Response(JSON.stringify({ 
      message: 'Avatar generation completed',
      generated: generatedAvatars.length,
      total: AVATAR_PROMPTS.length,
      avatars: generatedAvatars,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-avatars function:', error);
    return new Response(JSON.stringify({ 
      error: 'Avatar generation failed', 
      details: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});