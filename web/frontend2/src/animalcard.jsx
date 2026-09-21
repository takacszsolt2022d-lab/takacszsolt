function AnimalCard({ product, onDelete }) {
  return (
    <article className="animal-card">
      <h2>{product.name}</h2>
      <p>Ár: {product.price}</p>
      <button type="button" onClick={() => onDelete(product.id)}>
        Törlés
      </button>
    </article>
  );
}

export default AnimalCard;