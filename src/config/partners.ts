export type Partner = {
  name: string;
  logo?: string;
  href?: string;
};

/**
 * Add or remove verified seller partners here.
 *
 * - `logo` should point to a file placed in `public/partners/`
 *   (e.g. "/partners/digital-axis.png"). Leave it undefined to
 *   show a placeholder icon with the partner's name instead.
 * - `href` is optional — link to that seller's storefront page
 *   once one exists, or leave undefined for a non-clickable logo.
 */
export const partners: Partner[] = [
  {
    name: "Digital Axis",
    logo: "/partners/digital-axis.png",
  },
  {
    name: "RushPi Electronic",
    logo: "/partners/rushpi-electronic.png",
  },
];
