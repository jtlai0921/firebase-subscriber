$(function () {
  const subscriber = window.FirebaseSubscriber.subscriber

  const config = {
    databaseURL: 'https://hacker-news.firebaseio.com'
  }
  const options = {
    needAuth: false
  }
  const storyMap = {}
  let top5Ids = []
  const $stories = $('#stories')
  const $updateAt = $('#updateAt')
  const subscribe = subscriber(config, options)

  subscribe('v0/topstories').then((channel) => {
    channel.on('value', function (storyIds) {
      top5Ids = storyIds.slice(0, 5)
      top5Ids.forEach(function (storyId) {
        if (storyMap[storyId] === undefined) {
          fetchStory(storyId)
        }
      })
      const now = new Date()
      $updateAt.text(`${now.getHours()}:${now.getMinutes()}`)
    })
  })

  function fetchStory (storyId) {
    subscribe(`v0/item/${storyId}`).then((channel) => {
      channel.once('value', function (story) {
        storyMap[story.id] = story
        renderStories()
      })
    })
  }

  function renderStories () {
    const html = top5Ids.reduce(function (memo, storyId) {
      const story = storyMap[storyId]
      if (story) {
        return memo + `<p><a href="${story.url}">${story.title}</a></p>`
      } else {
        return memo + '<p>loading...</p>'
      }
    }, '')
    $stories.html(html)
  }
})
