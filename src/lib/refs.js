/**
 * refs.js
 * Referencias DOM compartidas entre la UI y la escena 3D (que se carga en
 * diferido, en otro chunk). La escena reposiciona el tooltip en cada frame
 * sin pasar por React.
 */
export const tooltipElRef = { current: null };
