/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { Link, graphql } from "gatsby"
import { RiArrowRightLine, RiArrowLeftLine } from "react-icons/ri"
import Layout from "../components/layout"
import PostCard from "../components/post-card"
import Seo from "../components/seo"

const styles = {
  pagination: {
    a: {
      color: "muted",
      "&.is-active": {
        color: "text",
      },
      "&:hover": {
        color: "text",
      },
    },
  },
}

export const blogListQuery = graphql`
  query blogListQuery($skip: Int!, $limit: Int!) {
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      filter: { frontmatter: { template: { eq: "blog-post" } } }
      limit: $limit
      skip: $skip
    ) {
      query($skip: Int, $limit: Int) { 
        pageQuery: allMarkdownRemark(
                sort: {fields: [frontmatter___date], order: DESC}, 
                filter: {frontmatter: {path: {regex: "/^\/blog/"}}},
                limit: $limit
                skip: $skip
            ) {
              tagsQuery: allMarkdownRemark(
                sort: {fields: [frontmatter___date], order: DESC}, 
                filter: {frontmatter: {path: {regex: "/^\/blog/"}}},
            ) {
      edges {
        node {
          id
          excerpt(pruneLength: 250)
          frontmatter {
            date(formatString: "MMMM DD, YYYY", locale: "ru-RU")
            slug
            title
            author
            featuredImage {
              childImageSharp {
                gatsbyImageData(layout: CONSTRAINED, width: 345, height: 260)
              }
            }
          }
        }
      }
    }
  }
`

const Pagination = props => (
  <div className="pagination" sx={styles.pagination}>
    <h3 className="blog-tags">Tags:</h3>
  {tags.map((tag) => (
    <Link to={`/tags/${_.kebabCase(tag)}/`} className="blog-tags">
      {tag}
  </Link>
  ))}
    <ul>
      {!props.isFirst && (
        <li>
          <Link to={props.prevPage} rel="prev">
            <span className="icon -left">
              <RiArrowLeftLine />
            </span>{" "}
            Назад
          </Link>
        </li>
      )}
      {Array.from({ length: props.numPages }, (_, i) => (
        <li key={`pagination-number${i + 1}`}>
          <Link
            to={`${props.blogSlug}${i === 0 ? "" : i + 1}`}
            className={props.currentPage === i + 1 ? "is-active num" : "num"}
          >
            {i + 1}
          </Link>
        </li>
      ))}
      {!props.isLast && (
        <li>
          <Link to={props.nextPage} rel="next">
            Вперёд {" "}
            <span className="icon -right">
              <RiArrowRightLine />
            </span>
          </Link>
        </li>
      )}
    </ul>
  </div>
)
class BlogIndex extends React.Component {
  render() {
    const { data } = this.props
    const { currentPage, numPages } = this.props.pageContext
    const blogSlug = "/blog/"
    const isFirst = currentPage === 1
    const isLast = currentPage === numPages
    const prevPage =
      currentPage - 1 === 1 ? blogSlug : blogSlug + (currentPage - 1).toString()
    const nextPage = blogSlug + (currentPage + 1).toString()

    const posts = data.allMarkdownRemark.edges
      .filter(edge => !!edge.node.frontmatter.date)
      .filter(edge => !!edge.node.frontmatter.author)
      .map(edge => <PostCard key={edge.node.id} data={edge.node} />)
    let props = {
      isFirst,
      prevPage,
      numPages,
      blogSlug,
      currentPage,
      isLast,
      nextPage,
    }
    let tags = []
    _.each(data.allMarkdownRemark.edges, edge => {
        if (_.get(edge, "node.frontmatter.tags")) {
          tags = tags.concat(edge.node.frontmatter.tags)
        }
      })
  
    // Eliminate duplicate tags
    tags = _.uniq(tags)

    return (
      <Layout className="blog-page">
        <Seo
          title={"Новости — Страница " + currentPage + " из " + numPages}
          description={
            "Stackrole base blog page " + currentPage + " из " + numPages
          }
        />
        <h1>Новости</h1>
        <div className="grids col-1 sm-2 lg-3">{posts}</div>
        <Pagination {...props} />
      </Layout>
    )
  }
}

export default BlogIndex
