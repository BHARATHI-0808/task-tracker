export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '24px', justifyContent: 'center' }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        style={{ padding: '6px 14px', cursor: page === 0 ? 'not-allowed' : 'pointer' }}
      >
        ← Prev
      </button>

      <span style={{ padding: '6px 14px', background: '#f3f4f6', borderRadius: '4px' }}>
        Page {page + 1} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        style={{ padding: '6px 14px', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
      >
        Next →
      </button>
    </div>
  );
}