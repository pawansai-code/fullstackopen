const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const helper = require('./test_helper')
const Blog = require('../models/blog')

describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    const blogs = response.body
    
    assert(blogs.every(blog => blog.id !== undefined))
    assert(blogs.every(blog => blog._id === undefined))
  })

  describe('addition of a new blog', () => {
    test('succeeds with valid data', async () => {
      const newBlog = {
        title: 'Async/await simplifies making async calls',
        author: 'Tester',
        url: 'https://fullstackopen.com',
        likes: 2
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

      const titles = blogsAtEnd.map(b => b.title)
      assert(titles.includes('Async/await simplifies making async calls'))
    })

    test('if likes property is missing, it will default to 0', async () => {
      const newBlog = {
        title: 'Blog without likes',
        author: 'Tester',
        url: 'https://nolikes.com'
      }

      const response = await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.likes, 0)
    })

    test('fails with status code 400 Bad Request if title or url is missing', async () => {
      const newBlogNoTitle = {
        author: 'No Title Author',
        url: 'https://missingtitle.com'
      }

      await api
        .post('/api/blogs')
        .send(newBlogNoTitle)
        .expect(400)

      const newBlogNoUrl = {
        title: 'Missing URL',
        author: 'No URL Author'
      }

      await api
        .post('/api/blogs')
        .send(newBlogNoUrl)
        .expect(400)

      const blogsAtEnd = await helper.blogsInDb()
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
    })
  })

  describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)

      const ids = blogsAtEnd.map(r => r.id)
      assert(!ids.includes(blogToDelete.id))
    })
  })

  describe('updating a blog', () => {
    test('succeeds in updating likes', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToUpdate = blogsAtStart[0]

      const updatedData = { ...blogToUpdate, likes: 100 }

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedData)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.likes, 100)

      const blogsAtEnd = await helper.blogsInDb()
      const updatedBlogInDb = blogsAtEnd.find(b => b.id === blogToUpdate.id)
      assert.strictEqual(updatedBlogInDb.likes, 100)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})
