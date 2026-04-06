const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null

  return blogs.reduce((favorite, blog) => {
    return favorite.likes > blog.likes ? favorite : blog
  })
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null

  const authors = _.countBy(blogs, 'author')
  const topAuthor = Object.keys(authors).reduce((a, b) => authors[a] > authors[b] ? a : b)

  return {
    author: topAuthor,
    blogs: authors[topAuthor]
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null

  const groupedByAuthor = _.groupBy(blogs, 'author')
  const authorLikes = Object.keys(groupedByAuthor).map(author => {
    return {
      author,
      likes: groupedByAuthor[author].reduce((sum, blog) => sum + blog.likes, 0)
    }
  })

  return authorLikes.reduce((max, current) => max.likes > current.likes ? max : current)
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
