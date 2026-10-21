function StarRating({ value = 0, onChange, disabled = false, color = '#f5c518', size = 16 }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <span role="radiogroup" aria-label="Rating" style={{ display: 'inline-flex', gap: '2px', color }}>
      {stars.map((star) => {
        const active = star <= Number(value || 0);
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${star} star`}
            disabled={disabled}
            onClick={() => onChange && onChange(star)}
            style={{
              border: 0,
              background: 'transparent',
              padding: 0,
              cursor: disabled ? 'default' : 'pointer',
              color: 'inherit',
              fontSize: `${size}px`,
              lineHeight: 1,
            }}
          >
            {active ? '★' : '☆'}
          </button>
        );
      })}
    </span>
  );
}

export default StarRating;
