import React from 'react'

/**
 * Product Section with WCAG Violations:
 * - Table used for layout
 * - Missing table headers
 * - Click events on non-interactive elements
 * - Images without alt text
 * - Color-only status indicators
 * - Tiny click targets
 */
function ProductSection() {
  const products = [
    { id: 1, name: 'Product A', price: '$99', status: 'available', color: 'green' },
    { id: 2, name: 'Product B', price: '$149', status: 'low-stock', color: 'yellow' },
    { id: 3, name: 'Product C', price: '$79', status: 'out-of-stock', color: 'red' },
    { id: 4, name: 'Product D', price: '$199', status: 'available', color: 'green' },
  ]

  const handleProductClick = (id) => {
    alert(`Product ${id} clicked!`)
  }

  return (
    // WCAG Violation: No section or article elements, no heading
    <div className="products-section">
      {/* WCAG Violation: Heading level skipped */}
      <h5>Our Products</h5>

      {/* WCAG Violation: Table used for layout purposes */}
      <table className="product-table">
        {/* WCAG Violation: No thead, no th elements, no scope attributes */}
        <tr>
          <td className="table-header">Image</td>
          <td className="table-header">Name</td>
          <td className="table-header">Price</td>
          <td className="table-header">Status</td>
          <td className="table-header">Action</td>
        </tr>
        {products.map((product) => (
          // WCAG Violation: Click handler on tr without keyboard support
          <tr
            key={product.id}
            className="product-row"
            onClick={() => handleProductClick(product.id)}
          >
            <td>
              {/* WCAG Violation: Image without alt text */}
              <img src={`https://via.placeholder.com/80x80`} className="product-img" />
            </td>
            <td className="product-name">{product.name}</td>
            <td className="product-price">{product.price}</td>
            <td>
              {/* WCAG Violation: Status conveyed by color only */}
              <span
                className="status-indicator"
                style={{ backgroundColor: product.color }}
              ></span>
            </td>
            <td>
              {/* WCAG Violation: Tiny click target, icon-only button */}
              <span className="add-to-cart-icon" onClick={(e) => {
                e.stopPropagation()
                alert('Added to cart!')
              }}>🛒</span>
            </td>
          </tr>
        ))}
      </table>

      {/* WCAG Violation: Pagination with poor accessibility */}
      <div className="pagination">
        {/* WCAG Violation: Links without meaningful text */}
        <a href="#">«</a>
        <a href="#">1</a>
        <a href="#" className="active">2</a>
        <a href="#">3</a>
        <a href="#">»</a>
      </div>

      {/* WCAG Violation: Progress bar without accessible value */}
      <div className="loading-bar">
        <div className="loading-progress" style={{ width: '65%' }}></div>
      </div>
    </div>
  )
}

export default ProductSection
