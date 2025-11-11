def insert_in_batches(supabase, rows, table_name, batch_size=100):
    total = len(rows)
    print(f"Inserting {total} rows in batches of {batch_size} into Supabase {table_name}...")

    for i in range(0, total, batch_size):
        batch = rows[i:i+batch_size]
        try:
            supabase.table(table_name).insert(batch).execute()
            print(f"✅ Inserted rows {i+1}-{i+len(batch)}")
        except Exception as e:
            print(f"❌ Error inserting batch {i+1}-{i+len(batch)}: {e}")
            # Optionally: write the failed batch to a file for retry
