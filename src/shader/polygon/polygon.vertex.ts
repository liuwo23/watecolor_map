export default `
    varying vec2 vUv;
    varying vec2 vPosition;

    void main(){
        vUv = uv;
        vPosition = position.xy;
        vec4 mvPosition = modelViewMatrix * vec4(position,1.0);
        gl_Position = projectionMatrix * mvPosition;
    }
`;