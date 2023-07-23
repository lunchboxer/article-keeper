<script>
  const icp = '湘ICP备20004695号-1'
</script>

<footer class="no-print">
  <p>
    <span class="copy">&copy; 2023 James Smith</span>
    {#if icp}
      |
      <span class="icp">{icp}</span>
    {/if}
  </p>
</footer>

<style>
  footer {
    width: 100%;
    text-align: center;
    font-size: 1.2rem;
    opacity: 0.6;
  }
  p {
    padding: 0;
    margin: 1rem;
  }
  span {
    margin: 0 1rem;
  }
</style>
