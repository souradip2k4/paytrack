create type builtin_colors as enum(
	'gray',
	'brown',
	'orange',
	'yellow',
	'green',
	'blue',
	'purple',
	'pink',
	'red'
);

create or replace function get_random_builtin_color () returns builtin_colors as $$
begin
    return (
        select enumlabel::builtin_colors 
        from pg_enum 
        where enumtypid = 'builtin_colors'::regtype 
        order by random() 
        limit 1
    );
end;
$$ language plpgsql volatile;

alter table categories
drop column color;

alter table categories
add column color builtin_colors default get_random_builtin_color ();
