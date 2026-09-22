import { buildListing } from "../../project/listing";
export async function getStaticPaths() {
  const listing = await buildListing();
  return [{ params: { manifest: `listing-${listing.hash}` }, props: { body: listing.body } }];
}
export function GET({ props }: { props: { body: string } }) {
  return new Response(props.body, { headers: { "Content-Type": "application/json" } });
}
