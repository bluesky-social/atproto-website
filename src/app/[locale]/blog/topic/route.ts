import { topicSelectHref } from '@/components/TopicSelect/topicHref'

// The topic <form> submits here when JavaScript is off. 303 turns the GET
// form submission into a plain navigation to the topic page.
export function GET(request: Request) {
  const url = new URL(request.url)
  const target = topicSelectHref(url.searchParams.get('topic'))
  return Response.redirect(new URL(target, url), 303)
}
