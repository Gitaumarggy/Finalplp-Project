import React from 'react';
import styles from '../styles/SearchBar.module.css';

function SearchBar({ search, setSearch, selectedTags, setSelectedTags, allTags }) {
  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchInputContainer}>
        <i className={`fas fa-search ${styles.searchIcon}`}></i>
        <input
          type="text"
          placeholder="Search recipes by title, ingredients, or instructions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        {search && (
          <button 
            onClick={() => setSearch('')}
            className={styles.clearButton}
          >
            ×
          </button>
        )}
      </div>
      
      {allTags && allTags.length > 0 && (
        <div className={styles.tagFilters}>
          <h4>Filter by Tags:</h4>
          <div className={styles.tagButtons}>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`${styles.tagButton} ${
                  selectedTags.includes(tag) ? styles.tagButtonActive : ''
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <button 
              onClick={() => setSelectedTags([])}
              className={styles.clearTagsButton}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
