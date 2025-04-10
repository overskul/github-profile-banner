export async function onRequest(context) {
  // Get parameters from URL
  const url = new URL(context.request.url);
  const username = url.searchParams.get('username') || 'github';
  const bgColor = url.searchParams.get('bg') || '0366d6';
  const textColor = url.searchParams.get('color') || 'ffffff';
  const pattern = url.searchParams.get('pattern') || 'none';
  
  // Fetch GitHub user data
  let userData;
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) throw new Error('User not found');
    userData = await response.json();
  } catch (error) {
    console.error('Error fetching GitHub user:', error);
    // Use fallback data
    userData = {
      avatar_url: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
      name: username,
      login: username
    };
  }
  
  // Create pattern elements based on selection
  let patternDefs = '';
  let patternElement = '';
  
  if (pattern === 'dots') {
    patternDefs = `
      <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.2)"/>
      </pattern>
    `;
    patternElement = '<rect width="100%" height="100%" fill="url(#dots)" />';
  } else if (pattern === 'lines') {
    patternDefs = `
      <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="50" height="50">
        <path d="M-10,10 l20,-20 M0,50 l50,-50 M40,60 l20,-20" 
              stroke="rgba(255,255,255,0.1)" stroke-width="10" />
      </pattern>
    `;
    patternElement = '<rect width="100%" height="100%" fill="url(#diagonalHatch)" />';
  } else if (pattern === 'waves') {
    patternDefs = `
      <pattern id="waves" width="100" height="20" patternUnits="userSpaceOnUse">
        <path d="M0,10 C20,5 35,15 50,10 C65,5 80,15 100,10" stroke="rgba(255,255,255,0.2)" 
              stroke-width="2" fill="none" />
      </pattern>
    `;
    patternElement = '<rect width="100%" height="100%" fill="url(#waves)" />';
  }
  
  // Create SVG content
  const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="800" height="200" viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="circleClip">
      <circle cx="80" cy="100" r="60" />
    </clipPath>
    ${patternDefs}
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="#${bgColor}" />
  ${patternElement}
  
  <!-- Profile Image with Circle Clip -->
  <circle cx="80" cy="100" r="62" fill="white" /> <!-- White border -->
  <image href="${userData.avatar_url}" x="20" y="40" width="120" height="120" clip-path="url(#circleClip)" />
  
  <!-- Username -->
  <text x="170" y="115" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" 
        font-size="36px" text-anchor="start" fill="#${textColor}" font-weight="600">
    ${(userData.name || userData.login).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
  </text>
</svg>
`;
  
  // Return the SVG with proper content type
  return new Response(svgContent, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'max-age=3600' // Cache for 1 hour
    }
  });
}