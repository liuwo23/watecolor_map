export default `
    uniform sampler2D texture1;
    uniform vec3 KColor;
    uniform vec3 SColor;
    uniform vec4 Box;

    varying vec2 vUv;
    varying vec2 vPosition;

    // Table of pigments 
    // from Computer-Generated Watercolor. Cassidy et al.
    // K is absortion. S is scattering
    vec3 K_QuinacridoneRose = vec3(0.22, 1.47, 0.57);
    vec3 S_QuinacridoneRose = vec3(0.05, 0.003, 0.03);
    vec3 K_FrenchUltramarine = vec3(0.86, 0.86, 0.06);
    vec3 S_FrenchUltramarine = vec3(0.005, 0.005, 0.09);
    vec3 K_CeruleanBlue = vec3(1.52, 0.32, 0.25);
    vec3 S_CeruleanBlue = vec3(0.06, 0.26, 0.40);
    vec3 K_HookersGreen = vec3(1.62, 0.61, 1.64);
    vec3 S_HookersGreen = vec3(0.01, 0.012, 0.003);
    vec3 K_HansaYellow = vec3(0.06, 0.21, 1.78);
    vec3 S_HansaYellow = vec3(0.50, 0.88, 0.009);
    vec3 K_CadmiumRed = vec3(0.14, 1.08, 1.68);
    vec3 S_CadmiumRed = vec3(0.77, 0.015, 0.018);
    vec3 K_IndianRed = vec3(0.46, 1.07, 1.50);
    vec3 S_IndianRed = vec3(1.28, 0.38, 0.21);
    vec3 K_InterferenceLilac = vec3(0.08, 0.11, 0.07);
    vec3 S_InterferenceLilac = vec3(1.25, 0.42, 1.43);

    // vec3 cosh(vec3 val) { vec3 e = exp(val); return (e + vec3(1.0) / e) / vec3(2.0); }
    // vec3 tanh(vec3 val) { vec3 e = exp(val); return (e - vec3(1.0) / e) / (e + vec3(1.0) / e); }
    // vec3 sinh(vec3 val) { vec3 e = exp(val); return (e - vec3(1.0) / e) / vec3(2.0); }

    // Kubelka-Munk reflectance and transmitance model
    void KM(vec3 k, vec3 s, float h, out vec3 refl, out vec3 trans)
    {
        vec3 a = (k+s)/s;
        vec3 b = sqrt(a*a - vec3(1.0));
        vec3 bsh = b*s*vec3(h);
        vec3 sinh_bsh = sinh(bsh);
        vec3 denom = b*cosh(bsh)+a*sinh_bsh;
        refl = sinh_bsh/denom;
        trans = b/denom;
    }

    // Kubelka-Munk model for layering
    void layering(vec3 r0, vec3 t0, vec3 r1, vec3 t1, out vec3 r, out vec3 t)
    {
        r = r0 + t0*t0*r1 / (vec3(1.0)-r0*r1);
        t = t0*t1 / (vec3(1.0)-r0*r1);
    }

    // Simple 2d noise fbm with 3 octaves
    float noise2d(vec2 p)
    {
        float t = texture2D(texture1, p).x;
        t += 0.5 * texture2D(texture1, p * 2.0).x;
        t += 0.25 * texture2D(texture1, p * 4.0).x;
        return t / 1.75;
    }

    void main(void){
        vec3 r0,t0,r1,t1;

        vec2 realUv = vec2((vPosition.x-Box.g)/(Box.r - Box.g),(vPosition.y-Box.a)/(Box.b - Box.a));

        float sky = 0.1 + 0.1 * noise2d(realUv * vec2(0.1));

        KM(KColor, SColor, sky, r0, t0);

	    gl_FragColor = vec4(r0+t0,1.0);
        // gl_FragColor = vec4(realUv.y,0.0,0.0,1.0);
        
        // gl_FragColor = texture2D(texture1, vUv);
    }

`