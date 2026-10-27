export function searchVendors(repository) {
  return async function execute(query) {
    return repository.search(query);
  };
}